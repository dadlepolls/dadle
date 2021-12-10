import { gql } from "@apollo/client";

export const GET_POLL_BY_LINK = gql`
  query GetPollByLink($pollLink: String!) {
    getPollByLink(pollLink: $pollLink) {
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
  }
`;
