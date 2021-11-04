import { Types } from "mongoose";
import { Field, ID, InputType, ObjectType, registerEnumType } from "type-graphql";
import { IPollChoice, IPollParticipation, YesNoMaybe } from "../util/types";

registerEnumType(YesNoMaybe, {
  name: "YesNoMaybe",
});

@ObjectType()
class PollChoice implements IPollChoice {
  @Field((type) => ID, {description: "references the ID of a PollOption of this very Poll"})
  option: Types.ObjectId;

  @Field((type) => YesNoMaybe)
  choice: YesNoMaybe;

  constructor(option: Types.ObjectId, choice: YesNoMaybe) {
    this.option = option;
    this.choice = choice;
  }
}

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
