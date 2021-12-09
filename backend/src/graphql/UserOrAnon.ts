import { Field, FieldResolver, ObjectType, Resolver, Root } from "type-graphql";
import { User } from "./User";
import { User as UserModel } from "../db/models";
import { ApolloError } from "apollo-server-errors";
import { IUserOrAnon } from "src/util/types";

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
  async user(@Root() userOrAnon: UserOrAnon) {
    if (!userOrAnon.userId) return null;

    const dbUser = await UserModel.findById(userOrAnon.userId);
    if (!dbUser) throw new ApolloError("User could not be found!");
    return dbUser;
  }
}

export { UserOrAnon, UserOrAnonResolver };
