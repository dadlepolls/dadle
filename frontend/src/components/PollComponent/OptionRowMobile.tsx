import { Card, Popover, Space } from "antd";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { ParticipationChoiceCell } from "./ParticipationChoiceCell";
import {
  IPollOption,
  PollOptionType,
  TAccumulatedChoicesPerOption,
  TPollWithOptionalAvailabilityHint,
  YesNoMaybe,
} from "./PollTypes";
import {
  determineAvailabilitySuggestion,
  mapChoiceToColorVariable,
} from "./util";

const OptionRowMobile = ({
  option,
  poll,
  responsesPerChoice,
  choice,
  onChoiceCellClick,
}: {
  option: IPollOption;
  poll: TPollWithOptionalAvailabilityHint;
  responsesPerChoice: TAccumulatedChoicesPerOption;
  choice?: YesNoMaybe;
  onChoiceCellClick: () => any;
}) => {
  const { t } = useTranslation("pollresponses");
  const from = option.from ? new Date(option.from) : null;
  const to = option.to ? new Date(option.to) : null;
  const responses = responsesPerChoice[option._id];
  const amountText = useMemo(() => {
    let text = responses.Yes.length.toString();
    if (responses.Maybe.length) text += ` (+${responses.Maybe.length})`;
    return text;
  }, [responses.Yes, responses.Maybe]);
  const hasResponses = useMemo(() => {
    return Object.values(responses).some((v) => v.length > 0);
  }, [responses.Yes, responses.No, responses.Maybe]);

  const typeIsDateOrDateTime =
    option.type == PollOptionType.Date ||
    option.type == PollOptionType.DateTime;

  const availabilityHint = poll.availabilityHints?.find(
    (h) => h.option == option._id
  );

  return (
    <div className="pollpage-mobile--option-row">
      {typeIsDateOrDateTime ? (
        <div className="pollpage-mobile--date">
          <span
            key="weekday"
            className="pollpage--participation-option-weekday"
          >
            {from?.toLocaleDateString(undefined, { weekday: "short" })}
          </span>
          <span key="day" className="pollpage--participation-option-day">
            {from?.getDate()}
          </span>
          <span key="month" className="pollpage--participation-option-month">
            {from?.toLocaleDateString(undefined, { month: "short" })}
          </span>
        </div>
      ) : null}
      <div className="pollpage-mobile--option-text-content">
        {option.type == PollOptionType.Arbitrary ? (
          <span>{option.title}</span>
        ) : null}
        {option.type == PollOptionType.Date ? <span>ganztägig</span> : null}
        {option.type == PollOptionType.DateTime ? (
          <span>
            {from?.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
            &nbsp; -&nbsp;
            {to?.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : null}
        <Popover
          open={hasResponses ? undefined : false}
          content={
            <Space direction="vertical" size="small">
              {(["Yes", "Maybe", "No"] as Array<YesNoMaybe>).map((opt) =>
                responses[opt].length ? (
                  <Card
                    key={opt}
                    size="small"
                    bodyStyle={{
                      backgroundColor: `var(${mapChoiceToColorVariable(
                        YesNoMaybe[opt]
                      )}`,
                      borderRadius: "8px",
                      maxWidth: "70vw",
                    }}
                  >
                    {responses[opt].join(", ")}
                  </Card>
                ) : null
              )}
            </Space>
          }
        >
          <b>
            {t("responses", {
              amount: amountText,
            })}
          </b>
        </Popover>
        {availabilityHint ? (
          <Popover
            open={availabilityHint.overlappingEvents.length ? undefined : false}
            content={availabilityHint.overlappingEvents
              .map((e) => e.title)
              .join(", ")}
          >
            <span>
              {t("overlapping_events", {
                count: availabilityHint.overlappingEvents.length,
              })}
            </span>
          </Popover>
        ) : null}
      </div>
      <ParticipationChoiceCell
        choice={choice}
        editable={true}
        /* eslint-disable indent */
        suggestionWhenEmpty={
          availabilityHint
            ? determineAvailabilitySuggestion(
                availabilityHint.overlappingEvents
              )
            : undefined
        }
        /* eslint-enable indent */
        onClick={onChoiceCellClick}
      />
    </div>
  );
};

export { OptionRowMobile };

