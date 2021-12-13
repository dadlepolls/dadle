import { gql } from "@apollo/client";
import { FULL_POLL } from "@operations/fragments/FullPoll";

export const GET_POLL_BY_LINK = gql`
  ${FULL_POLL}
  query GetPollByLink($pollLink: String!) {
    getPollByLink(pollLink: $pollLink) {
      ...FullPoll
    }
  }
`;
