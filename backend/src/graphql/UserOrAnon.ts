import {
  Ctx,
  Field,
  FieldResolver,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import { User } from "./User";
import { User as UserModel } from "../db/models";
import { IGraphContext, IUserOrAnon } from "src/util/types";
import { GraphQLError } from "graphql";

@ObjectType()
class UserOrAnon implements IUserOrAnon {
  @Field({ nullable: true })
  anonName?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  user?: User;
}

@Resolver(UserOrAnon)
class UserOrAnonResolver {
  @FieldResolver()
  async user(@Root() userOrAnon: UserOrAnon, @Ctx() ctx: IGraphContext) {
    if (!userOrAnon.userId) return null;

    const dbUser = await UserModel.findById(userOrAnon.userId);
    if (!dbUser) throw new GraphQLError("User could not be found!");

    //return full profile for authenticated user
    if (dbUser._id == ctx.user?._id) return dbUser;
    //return non-sensible fields (name, mail) for other users
    return { _id: dbUser._id, name: dbUser.name, mail: dbUser.mail };
  }
}

export { UserOrAnon, UserOrAnonResolver };
