import { graphAuthChecker } from "../auth/graphAuthChecker";
import { buildSchema } from "type-graphql";
import { PollResolver } from "./Poll";
import { UserResolver } from "./User";
import { UserOrAnonResolver } from "./UserOrAnon";
import { CalendarResolver } from "./Calendar";
import { PollAvailabilityHintResolver } from "./AvailabilityHint";
import { PollParticipationResolver } from "./PollParticipation";
import { PollCommentResolver } from "./PollComment";

const buildAppSchema = async () =>
  await buildSchema({
    resolvers: [
      PollResolver,
      PollParticipationResolver,
      PollCommentResolver,
      UserResolver,
      UserOrAnonResolver,
      CalendarResolver,
      PollAvailabilityHintResolver,
    ],
    authChecker: graphAuthChecker,
  });

export { buildAppSchema };
