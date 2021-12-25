import { ApolloError } from "apollo-server-errors";
import { ICalendar } from "src/integrations/calendar/calendar";
import { IGraphContext } from "src/util/types";
import {
  Authorized,
  Ctx,
  Field,
  ID,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User as UserModel } from "../db/models";

@ObjectType()
class Calendar implements Partial<ICalendar> {
  @Field(() => ID)
  _id: string;

  @Field()
  provider: "microsoft";

  @Field()
  enabled: boolean;

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
