import { IGraphContext, IPollComment } from "../util/types";
import {
  Arg,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import { UserOrAnon } from "./UserOrAnon";
import { Poll } from "./Poll";
import { Poll as PollModel } from "../db/models";
import { GraphQLError } from "graphql";

@ObjectType()
class PollComment implements IPollComment {
  @Field(() => ID)
  _id: string;

  @Field(() => UserOrAnon)
  author: UserOrAnon;

  @Field()
  text: string;

  constructor(_id: string, author: UserOrAnon, text: string) {
    this._id = _id;
    this.author = author;
    this.text = text;
  }
}

@InputType()
class PollCommentInput implements Partial<PollComment> {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field({
    nullable: true,
    description: "Name of comment author, in case user is not authenticated",
  })
  anonName?: string;

  @Field()
  text: string;

  constructor(anonName: string, text: string) {
    this.text = text;
  }
}

@Resolver(PollComment)
class PollCommentResolver {
  @Mutation(() => Poll)
  async createOrUpdateComment(
    @Arg("pollId", () => ID) pollId: string,
    @Arg("comment") commentInput: PollCommentInput,
    @Ctx() ctx: IGraphContext
  ) {
    const dbPoll = await PollModel.findOne({ _id: pollId }).exec();
    if (!dbPoll) {
      throw new GraphQLError("Couldn't find poll!", {
        extensions: { code: "POLL_NOT_FOUND" },
      });
    }

    if (!commentInput.anonName && !ctx.user?._id)
      throw new GraphQLError(
        "anonName must be given in case user is not authenticated",
        { extensions: { code: "INVALID_REQUEST" } }
      );

    if (commentInput._id) {
      const comment = dbPoll.comments?.find((c) => c._id == commentInput._id);
      if (!comment)
        throw new GraphQLError("Couldn't find comment!", {
          extensions: { code: "COMMENT_NOT_FOUND" },
        });

      if (comment.author.userId && comment.author.userId != ctx.user?._id)
        throw new GraphQLError("Can't edit comments of other users", {
          extensions: { code: "INSUFFICIENT_PERMISSIONS" },
        });

      comment.author = {
        anonName: commentInput.anonName,
        userId: !commentInput.anonName ? ctx.user?._id : undefined,
      };
      comment.text = commentInput.text;
    } else {
      dbPoll.comments?.push({
        ...commentInput,
        author: {
          anonName: commentInput.anonName,
          userId: !commentInput.anonName ? ctx.user?._id : undefined,
        },
      });
    }

    await dbPoll.save();
    return dbPoll.toObject();
  }

  @Mutation(() => Poll)
  async deleteComment(
    @Arg("pollId", () => ID) pollId: string,
    @Arg("commentId", () => ID) commentId: string,
    @Ctx() ctx: IGraphContext
  ) {
    const dbPoll = await PollModel.findOne({ _id: pollId }).exec();
    if (!dbPoll)
      throw new GraphQLError("Couldn't find poll!", {
        extensions: { code: "POLL_NOT_FOUND" },
      });

    const comment = dbPoll.comments?.find((c) => c._id == commentId);
    if (!comment)
      throw new GraphQLError("Couldn't find comment", {
        extensions: { code: "COMMENT_NOT_FOUND" },
      });

    if (comment.author.userId && comment.author.userId != ctx.user?._id)
      throw new GraphQLError("Can't delete comments of other users!", {
        extensions: { code: "INSUFFICIENT_PERMISSIONS" },
      });

    return (
      await PollModel.findByIdAndUpdate(
        pollId,
        {
          $pull: {
            comments: { _id: commentId },
          },
        },
        { new: true }
      )
    )?.toObject();
  }
}

export { PollComment, PollCommentInput, PollCommentResolver };
