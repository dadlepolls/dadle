import { IPollComment } from "../util/types";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import { UserOrAnon } from "./UserOrAnon";

@ObjectType()
class PollComment implements IPollComment {
  @Field(() => ID)
  _id: string;

  @Field(() => UserOrAnon)
  author: UserOrAnon;

  @Field()
  text: string;

  constructor(_id: string, author: UserOrAnon, text: string) {
    this._id = _id;
    this.author = author;
    this.text = text;
  }
}

@InputType()
class PollCommentInput implements Partial<PollComment> {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field({
    nullable: true,
    description: "Name of comment author, in case user is not authenticated",
  })
  anonName?: string;

  @Field()
  text: string;

  constructor(anonName: string, text: string) {
    this.text = text;
  }
}

export { PollComment, PollCommentInput };
