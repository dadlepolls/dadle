import {
  IPollOption,
  IPollOptionResponse,
  PollOptionType,
} from "../util/types";
import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { PollOptionResponse } from "./PollOptionResponse";

registerEnumType(PollOptionType, {
  name: "PollOptionType",
});

@ObjectType()
class PollOption implements IPollOption {
  @Field((type) => ID)
  _id: string;

  @Field((type) => PollOptionType)
  type: PollOptionType;

  @Field({ nullable: true })
  from?: Date;

  @Field({ nullable: true })
  to?: Date;

  @Field({ nullable: true })
  title?: string;

  @Field((type) => [PollOptionResponse], { nullable: true })
  responses?: PollOptionResponse[];

  constructor(_id: string, type: PollOptionType) {
    this._id = _id;
    this.type = type;
  }
}

@InputType()
class PollOptionInput implements Partial<PollOption> {
  @Field((type) => ID, { nullable: true })
  _id?: string;

  @Field((type) => PollOptionType)
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
