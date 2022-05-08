import {
  IPollParticipation,
  TPollWithOptionalAvailabilityHint,
} from "@components/PollComponent/PollTypes";
import { GetMe_me } from "@operations/queries/__generated__/GetMe";
import { GetPollAvailabilityHints_getPollByLink_availabilityHints } from "@operations/queries/__generated__/GetPollAvailabilityHints";
import { GetPollByLink_getPollByLink } from "@operations/queries/__generated__/GetPollByLink";

/**
 * Convert GraphQL poll query result to format required by poll component
 * @param poll Poll query result
 * @param me Currently authenticated user object
 * @param availabilityHints Optional availability hints
 * @returns poll component data (IPoll) for poll
 */
const convertQueriedPoll = (
  poll: GetPollByLink_getPollByLink,
  me?: GetMe_me,
  availabilityHints?: GetPollAvailabilityHints_getPollByLink_availabilityHints[]
): TPollWithOptionalAvailabilityHint => {
  const newParticipations = poll.participations.map<IPollParticipation>((p) => {
    const participationIsAnonymous = !p.author.user;
    const participationIsByMe = !!p.author.user && p.author.user._id == me?._id;

    return {
      _id: p._id,
      choices: p.choices,
      participantName: p.author.anonName ?? p.author.user?.name ?? "",
      allowEdit: participationIsAnonymous || participationIsByMe,
      allowNameEdit: participationIsAnonymous,
    };
  });

  return {
    _id: poll._id,
    title: poll.title,
    link: poll.link,
    timezone: poll.timezone,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt,
    comments: poll.comments,
    options: poll.options,
    author: poll.author,
    participations: newParticipations,
    availabilityHints: availabilityHints,
  };
};

export { convertQueriedPoll };
