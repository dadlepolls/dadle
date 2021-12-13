import { gql } from "@apollo/client";
import { FULL_POLL } from "@operations/fragments/FullPoll";

export const CREATE_OR_UPDATE_POLL = gql`
  ${FULL_POLL}
  mutation CreateOrUpdatePoll($poll: PollInput!) {
    createOrUpdatePoll(poll: $poll) {
      ...FullPoll
    }
  }
`;
