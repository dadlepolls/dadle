import { Field, ID, InputType, ObjectType } from "type-graphql";
import { IPollChoice, IPollParticipation } from "../util/types";
import { PollChoice } from "./PollChoice";
import { UserOrAnon } from "./UserOrAnon";

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
    description: "Name of participation author, in case user is not authenticated",
  })
  anonName?: string;

  @Field(() => [PollChoice])
  choices: IPollChoice[];

  constructor(_id: string, choices: PollChoice[]) {
    this._id = _id;
    this.choices = choices;
  }
}

export { PollParticipation, PollParticipationInput };
