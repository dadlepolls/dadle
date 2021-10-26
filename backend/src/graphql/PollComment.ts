import { IPollComment } from "../util/types";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
class PollComment implements IPollComment {
  @Field((type) => ID)
  _id: string;

  @Field()
  by: string;

  @Field()
  text: string;

  constructor(_id: string, by: string, text: string) {
    this._id = _id;
    this.by = by;
    this.text = text;
  }
}

export { PollComment };
