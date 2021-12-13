import { gql } from "@apollo/client";

export const FULL_POLL = gql`
  fragment FullPoll on Poll {
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
    createdAt
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
`;
