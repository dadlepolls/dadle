import { gql } from "@apollo/client";

export const UPDATE_NAME = gql`
  mutation UpdateName($name: String!) {
    updateName(newName: $name) {
      _id
      idAtProvider
      nameAtProvider
      mail
      name
    }
  }
`;
