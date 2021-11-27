import { IPollComment } from "../util/types";
import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
class PollComment implements IPollComment {
  @Field(() => ID)
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

@InputType()
class PollCommentInput implements Partial<PollComment> {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field()
  by: string;

  @Field()
  text: string;

  constructor(by: string, text: string) {
    this.by = by;
    this.text = text;
  }
}

export { PollComment, PollCommentInput };
