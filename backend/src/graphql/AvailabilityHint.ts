import {
  IAvailabilityHint,
  IEvent,
  IGraphContext,
  PollOptionType,
} from "../util/types";
import {
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  ID,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import { Event } from "./Event";
import { Poll } from "./Poll";
import { User as UserModel } from "../db/models";
import { ApolloError } from "apollo-server-express";
import moment from "moment";
import "moment-timezone";

type TFromTo = Pick<IEvent, "from" | "to">;

//type to represent a poll option (Date or DateTime) as a normalized event
interface IPollOptionNormalizedAsEvent extends TFromTo {
  optionId: string;
}

/**
 * Return all of searchEvents, that overlap mainEvent
 */
const getOverlappingEvents = (
  mainEvent: TFromTo,
  searchEvents: IEvent[]
): IEvent[] => {
  return searchEvents.filter((b) => {
    if (mainEvent.from < b.to && b.from < mainEvent.to) return true;
    return false;
  });
};

@ObjectType()
class AvailabilityHint implements IAvailabilityHint {
  @Field(() => ID)
  option: string;

  @Field(() => [Event])
  overlappingEvents: Event[];

  constructor(option: string, overlappingEvents: Event[]) {
    this.option = option;
    this.overlappingEvents = overlappingEvents;
  }
}

@Resolver(() => Poll)
class PollAvailabilityHintResolver {
  @Authorized()
  @FieldResolver()
  async availabilityHints(
    @Root() poll: Poll,
    @Ctx() ctx: IGraphContext
  ): Promise<AvailabilityHint[]> {
    if (!ctx.user?._id)
      throw new ApolloError(
        "User not authenticated!",
        "USER_NOT_AUTHENTICATED"
      );

    const user = await UserModel.findById(ctx.user._id);
    if (!user) throw new ApolloError("User deleted!", "USER_DELETED");

    const pollOptionsAsEvents = (poll.options || [])
      .filter(
        //only take Date or DateTime options
        (o) =>
          o.type == PollOptionType.Date || o.type == PollOptionType.DateTime
      )
      .map<IPollOptionNormalizedAsEvent>((o) => {
        if (o.type == PollOptionType.Date) {
          const from = moment.tz(o.from ?? "", poll.timezone).startOf("day");
          const to = from.clone().add(24, "hours");
          return {
            optionId: o._id,
            from: from.toDate(),
            to: to.toDate(),
          };
        } else if (o.type == PollOptionType.DateTime) {
          return {
            optionId: o._id,
            from: moment.tz(o.from ?? "", poll.timezone).toDate(),
            to: moment.tz(o.to ?? "", poll.timezone).toDate(),
          };
        } else {
          throw new Error(
            "Unsupported PollOptionType in availabilityHints resolver"
          );
        }
      });

    if (!pollOptionsAsEvents.length) return []; //no options with Date or DateTime type => no availability hints

    const earliestDate = pollOptionsAsEvents
      .map((e) => e.from)
      .reduce((earliest, current) => {
        return earliest > current ? current : earliest;
      });
    const latestDate = pollOptionsAsEvents
      .map((e) => e.to)
      .reduce((latest, current) => {
        return latest < current ? current : latest;
      });

    const userCalendarEvents = (
      await Promise.all(
        user
          .getCalendarProviders(true)
          .map((p) => p.retrieveEvents(earliestDate, latestDate))
      )
    ).flat();

    return pollOptionsAsEvents.map((o) => ({
      option: o.optionId,
      overlappingEvents: getOverlappingEvents(o, userCalendarEvents),
    }));
  }
}

export { AvailabilityHint, PollAvailabilityHintResolver };
