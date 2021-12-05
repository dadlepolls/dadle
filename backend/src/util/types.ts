import { Types as MongooseSchemaTypes } from "mongoose";

interface IPoll {
  _id?: string;
  title: string;
  link: string;
  author?: string;
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
  author: string;
  choices: IPollChoice[];
}

interface IPollComment {
  _id?: string;
  by: string;
  text: string;
}

export type {
  IPoll,
  IPollOption,
  IPollParticipation,
  IPollChoice,
  IPollComment,
};
export { PollOptionType, YesNoMaybe };
