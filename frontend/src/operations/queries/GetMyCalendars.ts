import { gql } from "@apollo/client";

export const GET_MY_CALENDARS = gql`
  query GetMyCalendars {
    getMyCalendars {
      _id
      provider
      enabled
      friendlyName
      usernameAtProvider
    }
  }
`;
