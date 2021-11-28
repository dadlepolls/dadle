import { gql } from "@apollo/client";

export const CREATE_POLL = gql`
  mutation CreatePoll($poll: PollInput!) {
    createPoll(poll: $poll) {
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
