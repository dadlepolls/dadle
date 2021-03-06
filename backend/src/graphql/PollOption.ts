import { IPollOption, PollOptionType } from "../util/types";
import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";

registerEnumType(PollOptionType, {
  name: "PollOptionType",
});

@ObjectType()
class PollOption implements IPollOption {
  @Field(() => ID)
  _id: string;

  @Field(() => PollOptionType)
  type: PollOptionType;

  @Field({ nullable: true })
  from?: Date;

  @Field({ nullable: true })
  to?: Date;

  @Field({ nullable: true })
  title?: string;

  constructor(_id: string, type: PollOptionType) {
    this._id = _id;
    this.type = type;
  }
}

@InputType()
class PollOptionInput implements Partial<PollOption> {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field(() => PollOptionType)
  type: PollOptionType;

  @Field({ nullable: true })
  from: Date;

  @Field({ nullable: true })
  to: Date;

  @Field({ nullable: true })
  title: string;

  constructor(type: PollOptionType, from: Date, to: Date, title: string) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.title = title;
  }
}

export { PollOption, PollOptionInput };
