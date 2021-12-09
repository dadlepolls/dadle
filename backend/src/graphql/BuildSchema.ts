import { graphAuthChecker } from "../auth/graphAuthChecker";
import { buildSchema } from "type-graphql";
import { PollResolver } from "./Poll";
import { UserResolver } from "./User";

const buildAppSchema = async () =>
  await buildSchema({
    resolvers: [PollResolver, UserResolver],
    authChecker: graphAuthChecker,
  });

export { buildAppSchema };
