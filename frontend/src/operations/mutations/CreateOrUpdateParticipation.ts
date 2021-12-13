import { gql } from "@apollo/client";
import { FULL_POLL } from "@operations/fragments/FullPoll";

export const CREATE_OR_UPDATE_PARTICIPATION = gql`
  ${FULL_POLL}
  mutation CreateOrUpdateParticipation(
    $pollId: ID!
    $participation: PollParticipationInput!
  ) {
    createOrUpdateParticipation(
      pollId: $pollId
      participation: $participation
    ) {
      ...FullPoll
    }
  }
`;
