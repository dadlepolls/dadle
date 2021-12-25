import { gql } from "@apollo/client";

export const GET_POLL_AVAILABILITY_HINTS = gql`
  query GetPollAvailabilityHints($pollLink: String!) {
    getPollByLink(pollLink: $pollLink) {
      _id
      availabilityHints {
        option
        overlappingEvents {
          title
          status
        }
      }
    }
  }
`;
