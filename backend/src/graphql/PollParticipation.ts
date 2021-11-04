import { Types } from "mongoose";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import { IPollChoice, IPollParticipation, YesNoMaybe } from "../util/types";
import { PollChoice } from "./PollChoice";

@ObjectType()
class PollParticipation implements IPollParticipation {
  @Field((type) => ID)
  _id: string;

  @Field()
  author: string;

  @Field((type) => [PollChoice])
  choices: IPollChoice[] = [];

  constructor(_id: string, author: string, choices: IPollChoice[]) {
    this._id = _id;
    this.author = author;
    this.choices = choices;
  }
}

export { PollParticipation };
