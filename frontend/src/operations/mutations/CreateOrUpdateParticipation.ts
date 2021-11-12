import { gql } from "@apollo/client";

export const CREATE_OR_UPDATE_PARTICIPATION = gql`
  mutation CreateOrUpdateParticipation(
    $pollId: ID!
    $participation: PollParticipationInput!
  ) {
    createOrUpdateParticipation(pollId: $pollId, participation: $participation) {
      _id
      title
      link
      author
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
