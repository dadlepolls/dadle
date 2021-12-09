import { gql } from "@apollo/client";

export const DELETE_PARTICIPATION = gql`
  mutation DeleteParticipation($pollId: ID!, $participationId: ID!) {
    deleteParticipation(pollId: $pollId, participationId: $participationId) {
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
        by
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
