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
}

export { Calendar, CalendarResolver };
