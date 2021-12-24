import { Types as MongooseSchemaTypes } from "mongoose";
import { ICalendar } from "src/integrations/calendar/calendar";

interface IPoll {
  _id?: string;
  title: string;
  link: string;
  author: IUserOrAnon;
  options?: IPollOption[];
  participations?: IPollParticipation[];
  comments?: IPollComment[];
  createdAt?: Date;
  updatedAt?: Date;
}

enum PollOptionType {
  Date = 1,
  DateTime,
  Arbitrary,
}

interface IPollOption {
  _id?: string;
  type: PollOptionType;
  from?: Date;
  to?: Date;
  title?: string;
}

enum YesNoMaybe {
  Yes = 1,
  No,
  Maybe,
}

interface IPollChoice {
  //id string of corresponding id
  option: MongooseSchemaTypes.ObjectId;
  choice: YesNoMaybe;
}

interface IPollParticipation {
  _id?: string;
  author: IUserOrAnon;
  choices: IPollChoice[];
}

interface IPollComment {
  _id?: string;
  author: IUserOrAnon;
  text: string;
}

interface IUser {
  _id?: string;
  provider: "microsoft";
  idAtProvider: string;
  nameAtProvider: string;
  name: string;
  mail: string;
  calendars?: [ICalendar];
}

interface IUserOrAnon {
  anonName?: string;
  userId?: string;
  user?: IUser;
}

interface IGraphContext {
  req: Express.Request;
  token?: string;
  user?: Partial<IUser>;
}

enum EventStatus {
  Confirmed = 1, //user confirmed event participation (show as busy)
  Tentative, //user intents to participate event (show as maybe)
  Free, //user is free during event
}

interface IEvent {
  title: string;
  from: Date;
  to: Date;
  status: EventStatus;
}

interface IAvailabilityHint {
  option: string;
  overlappingEvents: Pick<IEvent, "title" | "status">[];
}

export type {
  IPoll,
  IPollOption,
  IPollParticipation,
  IPollChoice,
  IPollComment,
  IUser,
  IUserOrAnon,
  IGraphContext,
  IEvent,
  IAvailabilityHint,
};
export { PollOptionType, YesNoMaybe, EventStatus };
