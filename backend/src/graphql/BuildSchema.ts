import { buildSchema } from "type-graphql";
import { PollResolver } from "./Poll";

const buildAppSchema = async () =>
  await buildSchema({
    resolvers: [PollResolver],
  });

export { buildAppSchema };
