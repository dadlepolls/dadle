import { gql } from "@apollo/client";

export const CREATE_OR_UPDATE_POLL = gql`
  mutation CreateOrUpdatePoll($poll: PollInput!) {
    createOrUpdatePoll(poll: $poll) {
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
    }
  }
`;
