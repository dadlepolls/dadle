import { PollOptionType, YesNoMaybe } from "__generated__/globalTypes";

interface Poll {
  _id: string;
  title: string;
  link: string;
  author?: string;
  options?: PollOption[];
  comments?: PollComment[];
}

interface PollOption {
  _id: string;
  type: PollOptionType;
  from?: Date;
  to?: Date;
  title?: string;
  responses?: PollOptionResponse[];
}

interface PollOptionResponse {
  _id: string;
  by: string;
  response: YesNoMaybe;
}

interface PollComment {
  _id: string;
  by: string;
  text: string;
}

export type { Poll, PollOption, PollOptionResponse, PollComment };
