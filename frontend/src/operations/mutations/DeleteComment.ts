import { gql } from "@apollo/client";
import { FULL_POLL } from "@operations/fragments/FullPoll";

export const DELETE_COMMENT = gql`
  ${FULL_POLL}
  mutation DeleteComment($pollId: ID!, $commentId: ID!) {
    deleteComment(pollId: $pollId, commentId: $commentId) {
      ...FullPoll
    }
  }
`;
