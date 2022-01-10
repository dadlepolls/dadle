import { gql } from "@apollo/client";

export const CHECK_LINK_AVAILABILITY = gql`
  query CheckLinkAvailability($link: String!) {
    checkPollLinkAvailability(link: $link)
  }
`;
