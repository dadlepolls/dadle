import { graphAuthChecker } from "../auth/graphAuthChecker";
import { buildSchema } from "type-graphql";
import { PollResolver } from "./Poll";
import { UserResolver } from "./User";
import { UserOrAnonResolver } from "./UserOrAnon";

const buildAppSchema = async () =>
  await buildSchema({
    resolvers: [PollResolver, UserResolver, UserOrAnonResolver],
    authChecker: graphAuthChecker,
  });

export { buildAppSchema };
