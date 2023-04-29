import { IGraphContext, IUser } from "src/util/types";
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
import { GraphQLError } from "graphql";

@ObjectType()
class User implements IUser {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  idAtProvider: string;

  @Field({ nullable: true })
  nameAtProvider: string;

  @Field()
  mail: string;

  @Field()
  name: string;

  constructor(
    _id: string,
    idAtProvider: string,
    nameAtProvider: string,
    mail: string,
    name: string
  ) {
    this._id = _id;
    this.idAtProvider = idAtProvider;
    this.nameAtProvider = nameAtProvider;
    this.mail = mail;
    this.name = name;
  }
}

@Resolver(User)
class UserResolver {
  @Authorized()
  @Query(() => User)
  async me(@Ctx() ctx: IGraphContext) {
    if (!ctx.user?._id)
      throw new GraphQLError("User not authenticated!", {
        extensions: { code: "USER_NOT_AUTHENTICATED" },
      });

    const user = await UserModel.findById(ctx.user._id);
    if (!user)
      throw new GraphQLError("User deleted!", {
        extensions: { code: "USER_DELETED" },
      });

    return user.toObject();
  }

  @Authorized()
  @Mutation(() => User)
  async updateName(@Arg("newName") newName: string, @Ctx() ctx: IGraphContext) {
    if (!ctx.user?._id)
      throw new GraphQLError("User not authenticated!", {
        extensions: { code: "USER_NOT_AUTHENTICATED" },
      });

    const user = await UserModel.findById(ctx.user._id);
    if (!user)
      throw new GraphQLError("User deleted!", {
        extensions: { code: "USER_DELETED" },
      });

    if (!newName) throw new GraphQLError("Name can't be empty!");
    user.name = newName;
    return (await user.save()).toObject();
  }
}

export { User, UserResolver };
