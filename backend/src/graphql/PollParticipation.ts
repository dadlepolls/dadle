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
import { IGraphContext, IPollChoice, IPollParticipation } from "../util/types";
import { Poll } from "./Poll";
import { PollChoice } from "./PollChoice";
import { UserOrAnon } from "./UserOrAnon";
import { Poll as PollModel } from "../db/models";
import { ApolloError } from "apollo-server-express";

@ObjectType()
class PollParticipation implements IPollParticipation {
  @Field(() => ID)
  _id: string;

  @Field(() => UserOrAnon)
  author: UserOrAnon;

  @Field(() => [PollChoice])
  choices: PollChoice[] = [];

  constructor(_id: string, author: UserOrAnon, choices: PollChoice[]) {
    this._id = _id;
    this.author = author;
    this.choices = choices;
  }
}

@InputType()
class PollParticipationInput implements Partial<IPollParticipation> {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field({
    nullable: true,
    description:
      "Name of participation author, in case user is not authenticated",
  })
  anonName?: string;

  @Field(() => [PollChoice])
  choices: IPollChoice[];

  constructor(_id: string, choices: PollChoice[]) {
    this._id = _id;
    this.choices = choices;
  }
}

@Resolver(PollParticipation)
class PollParticipationResolver {
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
}

export { PollParticipation, PollParticipationInput, PollParticipationResolver };
