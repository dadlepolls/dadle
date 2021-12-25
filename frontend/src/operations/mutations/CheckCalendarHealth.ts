import { gql } from "@apollo/client";

export const CHECK_CALENDAR_HEALTH = gql`
  mutation CheckCalendarHealth($calendarId: ID!) {
    checkCalendarHealth(calendarId: $calendarId){
      _id
      healthy
    }
  }
`;
