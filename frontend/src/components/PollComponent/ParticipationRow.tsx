import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import { ParticipationChoiceCell } from "./ParticipationChoiceCell";
import {
  IAvailabilityHint,
  IPollChoice,
  IPollOption,
  IPollParticipation
} from "./PollTypes";
import {
  deriveNextChoiceFromCurrent,
  determineAvailabilitySuggestion
} from "./util";

export const ParticipationRow = ({
  options,
  participation: propParticipation,
  availabilityHints,
  editable = false,
  onChoiceChange = () => {},
}: {
  options: IPollOption[];
  participation: Omit<IPollParticipation, "_id">;
  availabilityHints?: IAvailabilityHint[];
  editable?: boolean;
  onChoiceChange?: (newChoices: IPollChoice[]) => any;
}) => {
  const [participation, updateParticipation] = useImmer(propParticipation);

  //only show availability hints if some are given (not the case for unauthenticated users)
  const showAvailabilityHints =
    availabilityHints && availabilityHints.length > 0;

  const handleChoiceClick = (optionId: string) => {
    updateParticipation((participation) => {
      const p = participation.choices.find((c) => c.option == optionId);
      if (p) {
        participation.choices
          .filter((c) => c.option == optionId)
          .forEach((c) => (c.choice = deriveNextChoiceFromCurrent(c.choice)));
      } else {
        participation.choices.push({
          option: optionId,
          choice: determineAvailabilitySuggestion(
            availabilityHints?.find((h) => h.option == optionId)
              ?.overlappingEvents
          ),
        });
      }
    });
  };

  useEffect(() => {
    onChoiceChange(participation.choices);
  }, [participation, onChoiceChange]);

  return (
    <div className="pollpage--participation-choice-row">
      {options?.map((o, idx) => {
        const p = participation.choices.find((c) => c.option == o._id);
        return (
          <ParticipationChoiceCell
            key={idx}
            choice={p?.choice}
            suggestionWhenEmpty={
              /*eslint-disable indent */
              editable && showAvailabilityHints
                ? determineAvailabilitySuggestion(
                    availabilityHints?.find((h) => h.option == o._id)
                      ?.overlappingEvents
                  )
                : undefined
              /*eslint-enable indent */
            }
            overlappingEvents={
              /*eslint-disable indent */
              editable && showAvailabilityHints
                ? availabilityHints
                    ?.find((h) => h.option == o._id)
                    ?.overlappingEvents.map((e) => e.title)
                : undefined
              /*eslint-enable indent */
            }
            editable={editable}
            onClick={() => handleChoiceClick(o._id)}
          />
        );
      })}
    </div>
  );
};
