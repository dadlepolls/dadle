import { ApolloError } from "apollo-server-errors";
import { Min } from "class-validator";
import moment from "moment";
import "moment-timezone";
import { Error, Types } from "mongoose";
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  ID,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Poll as PollModel } from "../db/models";
import { IGraphContext, IPoll, IUserOrAnon } from "../util/types";
import { AvailabilityHint } from "./AvailabilityHint";
import { PollComment, PollCommentInput } from "./PollComment";
import { PollOption, PollOptionInput } from "./PollOption";
import { PollParticipation, PollParticipationInput } from "./PollParticipation";
import { UserOrAnon } from "./UserOrAnon";

@ObjectType()
class Poll implements IPoll {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  link: string;

  @Field()
  timezone: string;

  @Field(() => UserOrAnon)
  author: UserOrAnon;

  @Field(() => [PollOption])
  options?: PollOption[];

  @Field(() => [PollComment])
  comments?: PollComment[];

  @Field(() => [PollParticipation])
  participations?: PollParticipation[];

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => [AvailabilityHint], {
    description:
      "Get availability hints for options. Only for authenticated users. Query may take long, so omit this field for other operations",
  })
  availabilityHints?: AvailabilityHint[];

  constructor(
    _id: string,
    author: UserOrAnon,
    title: string,
    link: string,
    timezone: string
  ) {
    this._id = _id;
    this.author = author;
    this.title = title;
    this.link = link;
    this.timezone = timezone;
  }
}

@InputType()
class PollInput {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field()
  title: string;

  @Field()
  link: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field(() => [PollOptionInput])
  options: PollOptionInput[];

  constructor(
    title: string,
    link: string,
    timezone: string,
    options: PollOptionInput[]
  ) {
    this.title = title;
    this.link = link;
    this.timezone = timezone;
    this.options = options;
  }
}

@ArgsType()
class GetPollsArgs {
  @Field(() => Int, { nullable: true })
  @Min(0)
  first = 0;

  @Field(() => Int, { nullable: true })
  @Min(1)
  limit: number | undefined = undefined;
}

@ArgsType()
class GetPollByLinkArgs {
  @Field(() => String)
  pollLink: string;

  constructor(pollLink: string) {
    this.pollLink = pollLink;
  }
}

@Resolver(Poll)
class PollResolver {
  @Query(() => [Poll])
  async getPolls(@Args() { first, limit }: GetPollsArgs) {
    const query = PollModel.find();
    if (first) {
      query.skip(first);
    }
    if (limit) {
      query.limit(limit);
    }
    return (await query.exec()).map((o) => o.toObject());
  }

  @Authorized()
  @Query(() => [Poll])
  async getMyPolls(
    @Args() { first, limit }: GetPollsArgs,
    @Ctx() ctx: IGraphContext
  ) {
    const query = PollModel.find({
      "participations.author.userId": new Types.ObjectId(ctx.user?._id),
    });
    if (first) {
      query.skip(first);
    }
    if (limit) {
      query.limit(limit);
    }
    return (await query.exec()).map((o) => o.toObject());
  }

  @Query(() => Poll, { nullable: true })
  async getPollByLink(@Args() { pollLink }: GetPollByLinkArgs) {
    const polls = await PollModel.find({ link: pollLink });
    if (!polls.length) {
      throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
    }
    return polls[0].toObject();
  }

  @Mutation(() => Poll)
  async createOrUpdatePoll(
    @Arg("poll") poll: PollInput,
    @Ctx() ctx: IGraphContext
  ) {
    //validate that timezone is correct
    if (!poll.timezone) delete poll.timezone; //take nullish value and delete
    if (poll.timezone && !moment.tz.zone(poll.timezone))
      throw new ApolloError("Invalid timezone given!", "INVALID_REQUEST");

    if (poll._id) {
      //update an existing poll
      const dbPoll = await PollModel.findOne({ _id: poll._id }).exec();
      if (!dbPoll) {
        throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
      }

      if (dbPoll.author.userId && dbPoll.author.userId != ctx.user?._id)
        throw new ApolloError(
          "Can't edit polls of other users",
          "INSUFFICIENT_PERMISSIONS"
        );

      //manually update the new poll options since they require more logic, just copy the new poll props
      const { options: givenPollOptions, ...newPollProps } = poll;

      //take all poll props except the PollOptions
      let k: keyof typeof newPollProps;
      for (k in newPollProps) dbPoll[k] = newPollProps[k];

      //remove any poll options that don't exist in the new options
      dbPoll.options = dbPoll.options?.filter(
        (x) => x._id && givenPollOptions.some((o) => x._id == o._id)
      );

      //manually update the poll options
      for (const givenPollOpt of givenPollOptions) {
        if (
          !givenPollOpt._id ||
          !dbPoll.options?.some((x) => x._id == givenPollOpt._id)
        ) {
          //no id is given or id does not exist on db => create new option
          dbPoll.options?.push(givenPollOpt);
        }
        for (const opt of dbPoll.options?.filter(
          (x) => x._id == givenPollOpt._id
        ) || []) {
          //update a poll option with a specific id
          opt["title"] = givenPollOpt["title"];
          opt["from"] = givenPollOpt["from"];
          opt["to"] = givenPollOpt["to"];
          opt["type"] = givenPollOpt["type"];
        }
      }

      await dbPoll.save();
      return dbPoll.toObject();
    } else {
      //create a new poll
      const author: IUserOrAnon = {};
      if (ctx.user?._id) author.userId = ctx.user._id;
      else author.anonName = "";

      const pollDoc = new PollModel({ ...poll, author });
      try {
        await pollDoc.save();
      } catch (err) {
        if (err instanceof Error.ValidationError) {
          throw new ApolloError(
            "Poll validation failed!",
            "POLL_VALIDATION_FAILED",
            {
              message: err.message,
              stacktrace: err.stack,
            }
          );
        } else {
          throw err;
        }
      }

      return pollDoc.toObject();
    }
  }

  @Mutation(() => Boolean, { nullable: true })
  async deletePoll(
    @Arg("pollId", () => ID) pollId: string,
    @Ctx() ctx: IGraphContext
  ) {
    const poll = await PollModel.findOne({ _id: pollId }).exec();
    if (!poll) throw new ApolloError("Couldn't find poll", "POLL_NOT_FOUND");

    if (poll.author.userId && poll.author.userId != ctx.user?._id)
      throw new ApolloError(
        "Can't delete poll of other users!",
        "INSUFFICIENT_PERMISSIONS"
      );

    await poll.delete();

    return true;
  }

  @Mutation(() => Poll)
  async createOrUpdateParticipation(
    @Arg("pollId", () => ID) pollId: string,
    @Arg("participation") participationInput: PollParticipationInput,
    @Ctx() ctx: IGraphContext
  ) {
    const dbPoll = await PollModel.findOne({ _id: pollId }).exec();
    if (!dbPoll) {
      throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
    }

    if (!participationInput.anonName && !ctx.user?._id)
      throw new ApolloError(
        "anonName must be given in case user is not authenticated",
        "INVALID_REQUEST"
      );

    //validate that all options exist for this poll
    for (const opt of participationInput.choices) {
      if (!dbPoll.options?.some((o) => o._id == opt.option.toString())) {
        throw new ApolloError(
          "Response for unkown option given",
          "REPONSE_TO_INVALID_OPTION",
          { invalidOptionId: opt.option.toString() }
        );
      }
    }

    if (participationInput._id) {
      //participation does already exist, try to update
      const participation = dbPoll.participations?.find(
        (p) => p._id == participationInput._id
      );

      if (!participation)
        throw new ApolloError(
          "Couldn't find participation!",
          "PARTICIPATION_NOT_FOUND"
        );

      if (
        participation.author.userId &&
        participation.author.userId != ctx.user?._id
      )
        throw new ApolloError(
          "Can't edit participation of other users",
          "INSUFFICIENT_PERMISSIONS"
        );

      if (participation.author.userId && participationInput.anonName)
        throw new ApolloError(
          "Can't change a user-based to anonymous participation",
          "INSUFFICIENT_PERMISSIONS"
        );

      participation.author = {
        anonName: participationInput.anonName,
        userId: !participationInput.anonName ? ctx.user?._id : undefined,
      };

      for (const opt of participationInput.choices) {
        //update existing choices
        participation.choices.forEach((c) => {
          if (c.option == opt.option) c.choice = opt.choice;
        });
        //create new choices
        if (!participation.choices.some((c) => c.option == opt.option)) {
          participation.choices.push(opt);
        }
      }
    } else {
      if (!dbPoll.participations) dbPoll.participations = [];
      dbPoll.participations.push({
        ...participationInput,
        author: {
          anonName: participationInput.anonName,
          userId: !participationInput.anonName ? ctx.user?._id : undefined,
        },
      });
    }

    await dbPoll.save();
    return dbPoll.toObject();
  }

  @Mutation(() => Poll)
  async deleteParticipation(
    @Arg("pollId", () => ID) pollId: string,
    @Arg("participationId", () => ID) participationId: string,
    @Ctx() ctx: IGraphContext
  ) {
    const dbPoll = await PollModel.findOne({ _id: pollId }).exec();
    if (!dbPoll) throw new ApolloError("Couldn't find poll", "POLL_NOT_FOUND");

    const participation = dbPoll.participations?.find(
      (p) => p._id == participationId
    );
    if (!participation)
      throw new ApolloError(
        "Couldn't find participation",
        "PARTICIPATION_NOT_FOUND"
      );

    if (
      participation.author.userId &&
      participation.author.userId != ctx.user?._id
    )
      throw new ApolloError(
        "Can't delete participations of other users!",
        "INSUFFICIENT_PERMISSIONS"
      );

    return (
      await PollModel.findByIdAndUpdate(
        pollId,
        {
          $pull: {
            participations: { _id: participationId },
          },
        },
        { new: true }
      )
    )?.toObject();
  }

  @Mutation(() => Poll)
  async createOrUpdateComment(
    @Arg("pollId", () => ID) pollId: string,
    @Arg("comment") commentInput: PollCommentInput,
    @Ctx() ctx: IGraphContext
  ) {
    const dbPoll = await PollModel.findOne({ _id: pollId }).exec();
    if (!dbPoll) {
      throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
    }

    if (!commentInput.anonName && !ctx.user?._id)
      throw new ApolloError(
        "anonName must be given in case user is not authenticated",
        "INVALID_REQUEST"
      );

    if (commentInput._id) {
      const comment = dbPoll.comments?.find((c) => c._id == commentInput._id);
      if (!comment)
        throw new ApolloError("Couldn't find comment!", "COMMENT_NOT_FOUND");

      if (comment.author.userId && comment.author.userId != ctx.user?._id)
        throw new ApolloError(
          "Can't edit comments of other users",
          "INSUFFICIENT_PERMISSIONS"
        );

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
    if (!dbPoll) throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");

    const comment = dbPoll.comments?.find((c) => c._id == commentId);
    if (!comment)
      throw new ApolloError("Couldn't find comment", "COMMENT_NOT_FOUND");

    if (comment.author.userId && comment.author.userId != ctx.user?._id)
      throw new ApolloError(
        "Can't delete comments of other users!",
        "INSUFFICIENT_PERMISSIONS"
      );

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

export { Poll, PollResolver };
