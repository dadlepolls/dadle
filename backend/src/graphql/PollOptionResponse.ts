import { IPollOptionResponse, PollOptionResponseChoice } from "../util/types";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

registerEnumType(PollOptionResponseChoice, {
  name: "PollOptionResponseChoice",
});

@ObjectType()
class PollOptionResponse implements IPollOptionResponse {
  @Field((type) => ID)
  _id: string;

  @Field()
  by: string;

  @Field((type) => PollOptionResponseChoice)
  response: PollOptionResponseChoice;

  constructor(_id: string, by: string, response: PollOptionResponseChoice) {
    this._id = _id;
    this.by = by;
    this.response = response;
  }
}

export { PollOptionResponse };
