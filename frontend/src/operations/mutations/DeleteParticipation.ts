import { gql } from "@apollo/client";
import { FULL_POLL } from "@operations/fragments/FullPoll";

export const DELETE_PARTICIPATION = gql`
  ${FULL_POLL}
  mutation DeleteParticipation($pollId: ID!, $participationId: ID!) {
    deleteParticipation(pollId: $pollId, participationId: $participationId) {
      ...FullPoll
    }
  }
`;
