import { gql } from "@apollo/client";

export const SET_CALENDAR_ENABLED = gql`
  mutation SetCalendarEnabled($calendarId: ID!, $enabled: Boolean!) {
    setCalendarEnabled(calendarId: $calendarId, enabled: $enabled) {
      _id
      enabled
    }
  }
`;
