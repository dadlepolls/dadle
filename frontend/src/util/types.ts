interface Poll {
  _id: string;
  title: string;
  link: string;
  author?: string;
  options?: PollOption[];
  comments?: PollComment[];
}

enum PollOptionType {
  Date = 1,
  DateTime,
  Arbitrary,
}

interface PollOption {
  _id: string;
  type: PollOptionType;
  from?: Date;
  to?: Date;
  title?: string;
  responses?: PollOptionResponse[];
}

enum PollOptionResponseChoice {
  Yes = 1,
  No,
  Maybe,
}

interface PollOptionResponse {
  _id: string;
  by: string;
  response: PollOptionResponseChoice;
}

interface PollComment {
  _id: string;
  by: string;
  text: string;
}

export type { Poll, PollOption, PollOptionResponse, PollComment };
export { PollOptionType, PollOptionResponseChoice };

