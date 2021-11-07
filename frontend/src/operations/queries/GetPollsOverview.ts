import { gql } from "@apollo/client";

export const GET_POLLS_OVERVIEW = gql`
  query GetPollsOverview {
    getPolls {
      _id
      title
      link
      author
    }
  }
`;
