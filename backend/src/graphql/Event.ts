import { EventStatus, IEvent } from "../util/types";
import { Field, ObjectType, registerEnumType } from "type-graphql";

registerEnumType(EventStatus, {
  name: "EventStatus",
});

@ObjectType()
class Event implements Partial<IEvent> {
  @Field()
  title: string;

  @Field(() => EventStatus)
  status: EventStatus;

  constructor(title: string, status: EventStatus) {
    this.title = title;
    this.status = status;
  }
}

export { Event };
