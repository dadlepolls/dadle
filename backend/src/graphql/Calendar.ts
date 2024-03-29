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
import { GraphQLError } from "graphql";

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

  @Field()
  canWrite: boolean;

  constructor(
    _id: string,
    provider: "microsoft",
    enabled: boolean,
    friendlyName: string,
    usernameAtProvider: string,
    canWrite: boolean
  ) {
    this._id = _id;
    this.provider = provider;
    this.enabled = enabled;
    this.friendlyName = friendlyName;
    this.usernameAtProvider = usernameAtProvider;
    this.canWrite = canWrite;
  }
}

@Resolver(Calendar)
class CalendarResolver {
  @Authorized()
  @Query(() => [Calendar])
  async getMyCalendars(
    @Arg("onlyWritable", { defaultValue: false }) onlyWritable: boolean,
    @Ctx() ctx: IGraphContext
  ) {
    if (!ctx.user?._id)
      throw new GraphQLError("User not authenticated!", {
        extensions: { code: "USER_NOT_AUTHENTICATED" },
      });

    const user = await UserModel.findById(ctx.user._id);
    if (!user)
      throw new GraphQLError("User deleted!", {
        extensions: { code: "USER_DELETED" },
      });

    if (onlyWritable) return user.calendars?.filter((c) => c.canWrite);
    return user.calendars;
  }

  @Authorized()
  @Mutation(() => Calendar)
  async checkCalendarHealth(
    @Arg("calendarId", () => ID) calendarId: string,
    @Ctx() ctx: IGraphContext
  ) {
    if (!ctx.user?._id)
      throw new GraphQLError("User not authenticated!", {
        extensions: { code: "USER_NOT_AUTHENTICATED" },
      });

    const user = await UserModel.findById(ctx.user._id);
    if (!user)
      throw new GraphQLError("User deleted!", {
        extensions: { code: "USER_DELETED" },
      });

    const calendar = user.calendars?.find((c) => c._id == calendarId);
    if (!calendar)
      throw new GraphQLError("Calendar not found!", {
        extensions: { code: "CALENDAR_NOT_FOUND" },
      });

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
      throw new GraphQLError("User not authenticated!", {
        extensions: { code: "USER_NOT_AUTHENTICATED" },
      });

    const user = await UserModel.findById(ctx.user._id);
    if (!user)
      throw new GraphQLError("User deleted!", {
        extensions: { code: "USER_DELETED" },
      });

    const calendar = user.calendars?.find((c) => c._id == calendarId);
    if (!calendar)
      throw new GraphQLError("Calendar not found!", {
        extensions: { code: "CALENDAR_NOT_FOUND" },
      });

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
      throw new GraphQLError("User not authenticated!", {
        extensions: { code: "USER_NOT_AUTHENTICATED" },
      });

    const user = await UserModel.findById(ctx.user._id);
    if (!user)
      throw new GraphQLError("User deleted!", {
        extensions: { code: "USER_DELETED" },
      });

    const calendar = user.calendars?.find((c) => c._id == calendarId);
    if (!calendar)
      throw new GraphQLError("Calendar not found!", {
        extensions: { code: "CALENDAR_NOT_FOUND" },
      });

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
