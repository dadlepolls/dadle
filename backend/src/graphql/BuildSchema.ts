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
    //this only needs to be explicitely set for bugfix with type-graphql beta, see: https://github.com/MichalLytek/type-graphql/issues/1396
    validate: { forbidUnknownValues: false },
  });

export { buildAppSchema };
