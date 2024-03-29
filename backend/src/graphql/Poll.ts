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
import { PollComment } from "./PollComment";
import { PollOption, PollOptionInput } from "./PollOption";
import { PollParticipation } from "./PollParticipation";
import { UserOrAnon } from "./UserOrAnon";
import { GraphQLError } from "graphql";

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

  @Field({ nullable: true })
  link?: string;

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
class GetMyPollsArgs {
  @Field(() => Int, { nullable: true })
  @Min(0)
  first = 0;

  @Field(() => Int, { nullable: true })
  @Min(1)
  limit: number | undefined = undefined;

  @Field(() => Boolean, {
    nullable: true,
    description: "Include polls that were created by me",
  })
  includeCreatedByMe = true;

  @Field(() => Boolean, {
    nullable: true,
    description: "Include polls I've participated in",
  })
  includeParticipatedByMe = true;
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
  async getPolls(
    @Args() { first, limit }: GetPollsArgs,
    @Ctx() ctx: IGraphContext
  ) {
    let query;
    if (process.env.ALLOW_POLL_LISTING === "true") {
      query = PollModel.find();
    } else {
      //if listing of polls isn't explicitely allowed,
      //then only include user's polls or polls user participated in
      query = PollModel.find({
        $or: [
          { "participations.author.userId": new Types.ObjectId(ctx.user?._id) },
          { "author.userId": new Types.ObjectId(ctx.user?._id) },
        ],
      });
    }

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
    @Args()
    {
      first,
      limit,
      includeCreatedByMe,
      includeParticipatedByMe,
    }: GetMyPollsArgs,
    @Ctx() ctx: IGraphContext
  ) {
    const queryConditions = [];
    //include polls the authenticated user has participated in
    if (includeParticipatedByMe)
      queryConditions.push({
        "participations.author.userId": new Types.ObjectId(ctx.user?._id),
      });
    //include polls the author has created
    if (includeCreatedByMe)
      queryConditions.push({
        "author.userId": new Types.ObjectId(ctx.user?._id),
      });

    const query = PollModel.find({ $or: queryConditions });
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
      throw new GraphQLError("Couldn't find poll!", {
        extensions: { code: "POLL_NOT_FOUND" },
      });
    }
    return polls[0].toObject();
  }

  @Query(() => Boolean, {
    description:
      "Check if a poll link is currently available for use. Returns true if available",
  })
  async checkPollLinkAvailability(@Arg("link") link: string) {
    return (await PollModel.findOne({ link }).exec()) ? false : true;
  }

  @Mutation(() => Poll)
  async createOrUpdatePoll(
    @Arg("poll") poll: PollInput,
    @Ctx() ctx: IGraphContext
  ) {
    //validate that timezone is correct
    if (!poll.timezone) delete poll.timezone; //take nullish value and delete
    if (poll.timezone && !moment.tz.zone(poll.timezone))
      throw new GraphQLError("Invalid timezone given!", {
        extensions: { code: "INVALID_REQUEST" },
      });

    if (poll._id) {
      //update an existing poll
      const dbPoll = await PollModel.findOne({ _id: poll._id }).exec();
      if (!dbPoll) {
        throw new GraphQLError("Couldn't find poll!", {
          extensions: { code: "POLL_NOT_FOUND" },
        });
      }

      if (dbPoll.author.userId && dbPoll.author.userId != ctx.user?._id)
        throw new GraphQLError("Can't edit polls of other users", {
          extensions: { code: "INSUFFICIENT_PERMISSIONS" },
        });

      if (poll.link)
        throw new GraphQLError("Can't edit link of an existing poll", {
          extensions: { code: "INVALID_REQUEST" },
        });
      if (poll.title) dbPoll.title = poll.title;
      if (poll.timezone) dbPoll.timezone = poll.timezone;

      //remove any poll options that don't exist in the new options
      dbPoll.options = dbPoll.options?.filter(
        (x) => x._id && poll.options.some((o) => x._id == o._id)
      );

      //manually update the poll options
      for (const givenPollOpt of poll.options) {
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
      dbPoll.markModified("options");

      await dbPoll.save();
      return dbPoll.toObject();
    } else {
      //create a new poll
      const author: IUserOrAnon = {};
      if (ctx.user?._id) author.userId = ctx.user._id;
      else author.anonName = "";

      if (!poll.link)
        poll.link = poll.title
          .replace(/ /g, "-")
          .replace(/ä/g, "ae")
          .replace(/Ä/g, "AE")
          .replace(/ö/g, "oe")
          .replace(/Ö/g, "OE")
          .replace(/ü/g, "ue")
          .replace(/Ü/g, "UE")
          .replace(/(?![\w-])./g, "");

      //validate that link is unique
      if (await PollModel.findOne({ link: poll.link }).exec())
        throw new GraphQLError("Poll validation failed: Link must be unique", {
          extensions: { code: "POLL_VALIDATION_FAILED" },
        });

      const pollDoc = new PollModel({ ...poll, author });
      try {
        await pollDoc.save();
      } catch (err) {
        if (err instanceof Error.ValidationError) {
          throw new GraphQLError("Poll validation failed!", {
            extensions: {
              code: "POLL_VALIDATION_FAILED",
              message: err.message,
              stracktrace: err.stack,
            },
          });
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
    if (!poll)
      throw new GraphQLError("Couldn't find poll", {
        extensions: { code: "POLL_NOT_FOUND" },
      });

    if (poll.author.userId && poll.author.userId != ctx.user?._id)
      throw new GraphQLError("Can't delete poll of other users!", {
        extensions: { code: "INSUFFICIENT_PERMISSIONS" },
      });

    await poll.deleteOne();

    return true;
  }
}

export { Poll, PollResolver };
