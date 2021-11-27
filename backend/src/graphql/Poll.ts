import { ApolloError } from "apollo-server-errors";
import { Min } from "class-validator";
import { Error } from "mongoose";
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
import { IPoll } from "../util/types";
import { PollComment } from "./PollComment";
import { PollOption, PollOptionInput } from "./PollOption";
import { PollParticipation, PollParticipationInput } from "./PollParticipation";

@ObjectType()
class Poll implements IPoll {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  link: string;

  @Field({ nullable: true })
  author?: string;

  @Field(() => [PollOption])
  options?: PollOption[];

  @Field(() => [PollComment])
  comments?: PollComment[];

  @Field(() => [PollParticipation])
  participations?: PollParticipation[];

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

  @Field(() => [PollOptionInput])
  options: PollOptionInput[];

  constructor(title: string, link: string, options: PollOptionInput[]) {
    this.title = title;
    this.link = link;
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
    return await query.exec();
  }

  @Query(() => Poll, { nullable: true })
  async getPollByLink(@Args() { pollLink }: GetPollByLinkArgs) {
    const polls = await PollModel.find({ link: pollLink });
    if (!polls.length) {
      throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
    }
    return polls[0];
  }

  @Mutation(() => Poll)
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

  @Mutation(() => Poll)
  async updatePoll(
    @Arg("pollId", () => ID) pollId: string,
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

  @Mutation(() => Poll)
  async createOrUpdateParticipation(
    @Arg("pollId", () => ID) pollId: string,
    @Arg("participation") participationInput: PollParticipationInput
  ) {
    const dbPoll = await PollModel.findOne({ _id: pollId }).exec();
    if (!dbPoll) {
      throw new ApolloError("Couldn't find poll!", "POLL_NOT_FOUND");
    }

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

      participation.author = participationInput.author;

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
      dbPoll.participations.push(participationInput);
    }

    await dbPoll.save();
    return dbPoll;
  }

  @Mutation(() => Poll)
  async deleteParticipation(
    @Arg("pollId", () => ID) pollId: string,
    @Arg("participationId", () => ID) participationId: string
  ) {
    return await PollModel.findByIdAndUpdate(
      pollId,
      {
        $pull: {
          participations: { _id: participationId },
        },
      },
      { new: true }
    );
  }
}

export { PollResolver };
