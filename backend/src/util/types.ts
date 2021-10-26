interface IPoll {
  _id?: string;
  title: string;
  link: string;
  author?: string;
  options?: IPollOption[];
  comments?: IPollComment[];
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
  responses?: IPollOptionResponse[];
}

enum PollOptionResponseChoice {
  Yes = 1,
  No,
  Maybe,
}

interface IPollOptionResponse {
  _id?: string;
  by: string;
  response: PollOptionResponseChoice;
}

interface IPollComment {
  _id?: string;
  by: string;
  text: string;
}

export type { IPoll, IPollOption, IPollOptionResponse, IPollComment };
export { PollOptionType, PollOptionResponseChoice };

