import { graphAuthChecker } from "../auth/graphAuthChecker";
import { buildSchema } from "type-graphql";
import { PollResolver } from "./Poll";

const buildAppSchema = async () =>
  await buildSchema({
    resolvers: [PollResolver],
    authChecker: graphAuthChecker,
  });

export { buildAppSchema };
