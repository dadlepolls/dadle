import { Types } from "mongoose";
import { IPollChoice, YesNoMaybe } from "../util/types";
import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";

registerEnumType(YesNoMaybe, {
  name: "YesNoMaybe",
});

@InputType("PollChoiceInput")
@ObjectType()
class PollChoice implements IPollChoice {
  @Field((type) => ID, {
    description: "references the ID of a PollOption of this very Poll",
  })
  option: Types.ObjectId;

  @Field((type) => YesNoMaybe)
  choice: YesNoMaybe;

  constructor(option: Types.ObjectId, choice: YesNoMaybe) {
    this.option = option;
    this.choice = choice;
  }
}

export { PollChoice };
