import { gql } from "@apollo/client";
import { FULL_POLL } from "@operations/fragments/FullPoll";

export const CREATE_OR_UPDATE_COMMENT = gql`
  ${FULL_POLL}
  mutation CreateOrUpdateComment($pollId: ID!, $comment: PollCommentInput!) {
    createOrUpdateComment(pollId: $pollId, comment: $comment) {
      ...FullPoll
    }
  }
`;
