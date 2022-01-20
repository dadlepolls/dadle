import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      _id
      idAtProvider
      nameAtProvider
      mail
      name
    }
  }
`;
