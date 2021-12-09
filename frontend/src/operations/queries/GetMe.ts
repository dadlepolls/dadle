import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      _id
      provider
      idAtProvider
      nameAtProvider
      mail
      name
    }
  }
`;
