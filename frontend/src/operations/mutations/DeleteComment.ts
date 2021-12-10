import { gql } from "@apollo/client";

export const DELETE_COMMENT = gql`
  mutation DeleteComment($pollId: ID!, $commentId: ID!) {
    deleteComment(pollId: $pollId, commentId: $commentId) {
      _id
      title
      link
      author {
        anonName
        user {
          _id
          name
        }
      }
      updatedAt
      comments {
        _id
        author {
          anonName
          user {
            _id
            name
          }
        }
        text
      }
      options {
        _id
        type
        from
        to
        title
      }
      participations {
        _id
        author
        choices {
          choice
          option
        }
      }
    }
  }
`;
