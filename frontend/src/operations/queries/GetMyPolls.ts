import { gql } from "@apollo/client";
import { FULL_POLL } from "@operations/fragments/FullPoll";

export const GET_MY_POLLS = gql`
  ${FULL_POLL}
  query GetMyPolls {
    getMyPolls {
      ...FullPoll
    }
  }
`;
