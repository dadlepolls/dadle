import { ApolloError } from "apollo-server-errors";
import { Min } from "class-validator";
import { IPoll } from "../util/types";
import {
  Arg,
  Args,
  ArgsType,
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
import { PollComment } from "./PollComment";
import { PollOption, PollOptionInput } from "./PollOption";
import { Error, Model } from "mongoose";

@ObjectType()
class Poll implements IPoll {
  @Field((type) => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  link: string;

  @Field({ nullable: true })
  author?: string;

  @Field((type) => [PollOption])
  options?: PollOption[];

  @Field((type) => [PollComment])
  comments?: PollComment[];

  constructor(_id: string, title: string, link: string) {
    this._id = _id;
    this.title = title;
    this.link = link;
  }
}

@InputType()
class PollInput {
  @Field()
  title: string;

  @Field()
  link: string;

  @Field((type) => [PollOptionInput])
  options: PollOptionInput[];

  constructor(title: string, link: string, options: PollOptionInput[]) {
    this.title = title;
    this.link = link;
    this.options = options;
  }
}

@ArgsType()
class GetPollsArgs {
  @Field((type) => Int, { nullable: true })
  @Min(0)
  first: number = 0;

  @Field((type) => Int, { nullable: true })
  @Min(1)
  limit: number | undefined = undefined;
}

@ArgsType()
class GetPollByLinkArgs {
  @Field((type) => String)
  pollLink: string;

  constructor(pollLink: string) {
    this.pollLink = pollLink;
  }
}

@Resolver(Poll)
class PollResolver {
  constructor() {}

  @Query((returns) => [Poll])
  async getPolls(@Args() { first, limit }: GetPollsArgs) {
    const query = PollModel.find();
    if (first) {
      query.skip(first);
    }
    if (limit) {
      query.limit(limit);
    }
    return await query.exec();
  }

  @Query((returns) => Poll, { nullable: true })
  async getPollByLink(@Args() { pollLink }: GetPollByLinkArgs) {
    const polls = await PollModel.find({ link: pollLink });
    if (!polls.length) {
      throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
    }
    return polls[0];
  }

  @Mutation((returns) => Poll)
  async createPoll(@Arg("poll") poll: PollInput) {
    //TODO take author from user session once authentication is implemented
    const pollDoc = new PollModel({ ...poll, author: "Dummy Author" });
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

    return pollDoc;
  }

  @Mutation((returns) => Poll)
  async updatePoll(
    @Arg("pollId", (type) => ID) pollId: string,
    @Arg("poll") poll: PollInput
  ) {
    const dbPoll = await PollModel.findOne({ _id: pollId }).exec();
    if (!dbPoll) {
      throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
    }

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
        //TODO manually assigning object properties
        opt["title"] = givenPollOpt["title"];
        opt["from"] = givenPollOpt["from"];
        opt["to"] = givenPollOpt["to"];
        opt["type"] = givenPollOpt["type"];
      }
    }

    await dbPoll.save();
    return dbPoll;
  }
}

export { PollResolver };
