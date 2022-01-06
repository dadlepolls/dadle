import { gql } from "@apollo/client";

export const DELETE_POLL = gql`
  mutation DeletePoll($pollId: ID!) {
    deletePoll(pollId: $pollId)
  }
`;
