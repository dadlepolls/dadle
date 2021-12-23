import { graphAuthChecker } from "../auth/graphAuthChecker";
import { buildSchema } from "type-graphql";
import { PollResolver } from "./Poll";
import { UserResolver } from "./User";
import { UserOrAnonResolver } from "./UserOrAnon";
import { CalendarResolver } from "./Calendar";

const buildAppSchema = async () =>
  await buildSchema({
    resolvers: [
      PollResolver,
      UserResolver,
      UserOrAnonResolver,
      CalendarResolver,
    ],
    authChecker: graphAuthChecker,
  });

export { buildAppSchema };
