import { gql } from "@apollo/client";

export const DELETE_CALENDAR = gql`
  mutation DeleteCalendar($calendarId: ID!) {
    deleteCalendar(calendarId: $calendarId)
  }
`;
