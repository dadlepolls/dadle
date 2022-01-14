import { ApolloError } from "apollo-server-errors";
import {
  getProviderForCalendar,
  ICalendar,
} from "../integrations/calendar/calendar";
import { IGraphContext } from "../util/types";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User as UserModel } from "../db/models";
import logger from "../log";

@ObjectType()
class Calendar implements Omit<Partial<ICalendar>, "provider"> {
  @Field(() => ID)
  _id: string;

  @Field()
  provider: "google" | "microsoft";

  @Field()
  enabled: boolean;

  @Field({ nullable: true })
  healthy?: boolean;

  @Field()
  friendlyName: string;

  @Field()
  usernameAtProvider: string;

  constructor(
    _id: string,
    provider: "microsoft",
    enabled: boolean,
    friendlyName: string,
    usernameAtProvider: string
  ) {
    this._id = _id;
    this.provider = provider;
    this.enabled = enabled;
    this.friendlyName = friendlyName;
    this.usernameAtProvider = usernameAtProvider;
  }
}

@Resolver(Calendar)
class CalendarResolver {
  @Authorized()
  @Query(() => [Calendar])
  async getMyCalendars(@Ctx() ctx: IGraphContext) {
    if (!ctx.user?._id)
      throw new ApolloError(
        "User not authenticated!",
        "USER_NOT_AUTHENTICATED"
      );

    const user = await UserModel.findById(ctx.user._id);
    if (!user) throw new ApolloError("User deleted!", "USER_DELETED");

    return user.calendars;
  }

  @Authorized()
  @Mutation(() => Calendar)
  async checkCalendarHealth(
    @Arg("calendarId", () => ID) calendarId: string,
    @Ctx() ctx: IGraphContext
  ) {
    if (!ctx.user?._id)
      throw new ApolloError(
        "User not authenticated!",
        "USER_NOT_AUTHENTICATED"
      );

    const user = await UserModel.findById(ctx.user._id);
    if (!user) throw new ApolloError("User deleted!", "USER_DELETED");

    const calendar = user.calendars?.find((c) => c._id == calendarId);
    if (!calendar)
      throw new ApolloError("Calendar not found!", "CALENDAR_NOT_FOUND");

    const provider = getProviderForCalendar(calendar);

    try {
      //try retrieving some events
      await provider.retrieveEvents(
        new Date(),
        new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
      );
      calendar.healthy = true;
    } catch (err) {
      logger.info(
        `Calendar health check failed for user ${user._id}, cal ${calendar._id}`,
        { user: user._id, calendar: calendar._id, error: err }
      );
      calendar.healthy = false;
    }

    return calendar;
  }

  @Authorized()
  @Mutation(() => Calendar)
  async setCalendarEnabled(
    @Arg("calendarId", () => ID) calendarId: string,
    @Arg("enabled") enabled: boolean,
    @Ctx() ctx: IGraphContext
  ) {
    if (!ctx.user?._id)
      throw new ApolloError(
        "User not authenticated!",
        "USER_NOT_AUTHENTICATED"
      );

    const user = await UserModel.findById(ctx.user._id);
    if (!user) throw new ApolloError("User deleted!", "USER_DELETED");

    const calendar = user.calendars?.find((c) => c._id == calendarId);
    if (!calendar)
      throw new ApolloError("Calendar not found!", "CALENDAR_NOT_FOUND");

    calendar.enabled = enabled;
    user.markModified("calendars");
    await user.save();

    return user.calendars?.find((c) => c._id == calendarId);
  }

  @Mutation(() => Boolean, { nullable: true })
  async deleteCalendar(
    @Arg("calendarId", () => ID) calendarId: string,
    @Ctx() ctx: IGraphContext
  ) {
    if (!ctx.user?._id)
      throw new ApolloError(
        "User not authenticated!",
        "USER_NOT_AUTHENTICATED"
      );

    const user = await UserModel.findById(ctx.user._id);
    if (!user) throw new ApolloError("User deleted!", "USER_DELETED");

    const calendar = user.calendars?.find((c) => c._id == calendarId);
    if (!calendar)
      throw new ApolloError("Calendar not found!", "CALENDAR_NOT_FOUND");

    await UserModel.findByIdAndUpdate(
      ctx.user._id,
      {
        $pull: {
          calendars: { _id: calendarId },
        },
      },
      { new: true }
    );
  }
}

export { Calendar, CalendarResolver };
