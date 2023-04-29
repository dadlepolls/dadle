import { theme } from "antd";
import {
  EventStatus,
  IAvailabilityHintOverlappingEvent,
  IPoll,
  TAccumulatedChoicesPerOption,
  TPollParticipationWithOptionalId,
  YesNoMaybe,
} from "./PollTypes";

const { useToken } = theme;

/**
 * Determine the availability suggestion for an option
 * If there is at least one confirmed event, suggest "no"
 * If there are only tentative events, suggest "maybe"
 * Suggest "yes" else
 * @param hint overlapping events
 * @returns availability suggestion
 */
const determineAvailabilitySuggestion = (
  events?: IAvailabilityHintOverlappingEvent[]
) => {
  if (events?.some((e) => e.status == EventStatus.Confirmed))
    return YesNoMaybe.No;
  if (events?.some((e) => e.status == EventStatus.Tentative))
    return YesNoMaybe.Maybe;
  return YesNoMaybe.Yes;
};

/**
 * Get an empty editable participation
 * @param authenticatedUserId ID of the currently authenticated user, undefined if not authenticated
 * @param nameHint Name hint for anonymous poll
 * @returns Empty poll participation with user details
 */
const getEmptyEditableParticipation = (
  allowNameEdit: boolean,
  nameHint?: string
): TPollParticipationWithOptionalId => ({
  allowNameEdit,
  participantName: nameHint ?? "",
  allowEdit: true,
  choices: [],
});

/**
 * Get the next choice when clicking
 * @param currentChoice Current choice
 * @returns Next choice after click
 */
const deriveNextChoiceFromCurrent = (currentChoice?: YesNoMaybe) => {
  switch (currentChoice) {
    case YesNoMaybe.Yes:
      return YesNoMaybe.No;
    case YesNoMaybe.No:
      return YesNoMaybe.Maybe;
    case YesNoMaybe.Maybe:
    default:
      return YesNoMaybe.Yes;
  }
};

/**
 * Map a choice and a availability hint to a CSS color class
 * @param choice Selected choice or undefined
 * @param availabilityHint Avilability hint for selected choice
 * @returns CSS color class name
 */
const mapChoiceToColorVariable = (
  choice?: YesNoMaybe,
  availabilityHint?: YesNoMaybe
) => {
  if (!choice && availabilityHint) {
    //user gave no choice, but there is an availability hint
    switch (availabilityHint) {
      case YesNoMaybe.Yes:
        return "--pollpage--yes-hint-color";
      case YesNoMaybe.No:
        return "--pollpage--no-hint-color";
      case YesNoMaybe.Maybe:
        return "--pollpage--maybe-hint-color";
    }
  }
  switch (choice) {
    case YesNoMaybe.Yes:
      return "--pollpage--yes-color";
    case YesNoMaybe.No:
      return "--pollpage--no-color";
    case YesNoMaybe.Maybe:
      return "--pollpage--maybe-color";
    default:
      return "--pollpage--border-color";
  }
};

/**
 * Get the amount of choice counts per option
 * @param poll
 * @returns
 */
const getChoiceCountPerOption = (
  poll: IPoll | undefined | null
): TAccumulatedChoicesPerOption => {
  return (
    poll?.options.reduce((map: TAccumulatedChoicesPerOption, o) => {
      const getRespondersForChoice = (choice: YesNoMaybe) =>
        poll?.participations
          .filter((p) =>
            p.choices.some((c) => c.option == o._id && c.choice == choice)
          )
          .map((p) => p.participantName);
      map[o._id] = {
        Yes: getRespondersForChoice(YesNoMaybe.Yes),
        No: getRespondersForChoice(YesNoMaybe.No),
        Maybe: getRespondersForChoice(YesNoMaybe.Maybe),
      };
      return map;
    }, {}) || {}
  );
};

/**
 * Hook for getting a css style that
 * sets poll color variables according
 * to theme used
 */
const useThemedColorVars = () => {
  const themeTokens = useToken();

  return `
      :root {
        --pollpage--border-color: ${themeTokens.token.colorBorderSecondary};
        --pollpage--background-color: ${themeTokens.token.colorBgContainer};
      }
    `;
};

export {
  determineAvailabilitySuggestion,
  getEmptyEditableParticipation,
  deriveNextChoiceFromCurrent,
  mapChoiceToColorVariable,
  getChoiceCountPerOption,
  useThemedColorVars,
};
