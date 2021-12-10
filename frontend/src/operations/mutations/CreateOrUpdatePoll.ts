import { gql } from "@apollo/client";

export const CREATE_OR_UPDATE_POLL = gql`
  mutation CreateOrUpdatePoll($poll: PollInput!) {
    createOrUpdatePoll(poll: $poll) {
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
    }
  }
`;
