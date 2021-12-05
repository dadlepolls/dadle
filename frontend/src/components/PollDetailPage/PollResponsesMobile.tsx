import { SaveOutlined } from "@ant-design/icons";
import {
  GetPollByLink_getPollByLink,
  GetPollByLink_getPollByLink_options
} from "@operations/queries/__generated__/GetPollByLink";
import { Button, Col, Input, List, message, Popover, Row } from "antd";
import React, { useState } from "react";
import { useImmer } from "use-immer";
import { PollOptionType, YesNoMaybe } from "__generated__/globalTypes";
import {
  deriveNextChoiceFromCurrent,
  getChoiceCountPerOption,
  mapChoiceToColorVariable,
  ParticipationChoiceCell,
  TPartialParticipationWithId
} from "./PollResponses";

const OptionRow = ({
  option,
  poll,
  responsesPerChoice,
  choice,
  onChoiceCellClick,
}: {
  option: GetPollByLink_getPollByLink_options;
  poll: GetPollByLink_getPollByLink;
  responsesPerChoice: ReturnType<typeof getChoiceCountPerOption>;
  choice?: YesNoMaybe;
  onChoiceCellClick: () => any;
}) => {
  const from = option.from ? new Date(option.from) : null;
  const to = option.to ? new Date(option.to) : null;
  const responses = responsesPerChoice[option._id];

  const typeIsDateOrDateTime =
    option.type == PollOptionType.Date ||
    option.type == PollOptionType.DateTime;

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
          content={
            <List
              size="small"
              dataSource={poll.participations}
              renderItem={(p) =>
                p.choices.some((c) => c.option == option._id) ? (
                  <List.Item
                    style={{
                      backgroundColor: `var(${mapChoiceToColorVariable(
                        p.choices.find((c) => c.option == option._id)?.choice
                      )})`,
                      color: "white",
                    }}
                  >
                    {p.author}
                  </List.Item>
                ) : null
              }
            />
          }
        >
          <b>
            {responses.yes ?? 0}&nbsp;
            {responses.maybe ? `(+${responses.maybe}) ` : null}Zusagen
          </b>
        </Popover>
      </div>
      <ParticipationChoiceCell
        choice={choice}
        editable={true}
        onClick={onChoiceCellClick}
      />
    </div>
  );
};

const PollResponsesMobile = ({
  poll,
  saveParticipationFunction: saveParticipation,
}: {
  poll: GetPollByLink_getPollByLink;
  saveParticipationFunction: (
    participation: TPartialParticipationWithId
  ) => Promise<any>;
  deleteParticipationFunction: (participationId: string) => Promise<any>;
}) => {
  const emptyEditableParticipation = { author: "", choices: [] };
  const [editableParticipation, updateEditableParticipation] =
    useImmer<TPartialParticipationWithId>(emptyEditableParticipation);

  const [isSaving, setIsSaving] = useState(false);

  const responsesPerChoice = getChoiceCountPerOption(poll);

  return (
    <div className="pollpage-mobile--options">
      {poll.options.map((option, idx) => (
        <OptionRow
          key={idx}
          option={option}
          poll={poll}
          responsesPerChoice={responsesPerChoice}
          choice={
            editableParticipation?.choices.find((c) => c.option == option._id)
              ?.choice
          }
          onChoiceCellClick={() =>
            updateEditableParticipation((p) => {
              const existingChoice = p?.choices.find(
                (c) => c.option == option._id
              );
              if (existingChoice)
                existingChoice.choice = deriveNextChoiceFromCurrent(
                  existingChoice.choice
                );
              else
                p?.choices.push({
                  choice: YesNoMaybe.Yes,
                  option: option._id,
                  __typename: "PollChoice",
                });
            })
          }
        />
      ))}
      <Row style={{ marginTop: 16 }} gutter={[8, 8]}>
        <Col flex="auto">
          <Input
            type="text"
            placeholder="Name"
            value={editableParticipation.author}
            onChange={(e) =>
              updateEditableParticipation((p) => {
                p.author = e.target.value;
              })
            }
          />
        </Col>
        <Col>
          <Button
            icon={<SaveOutlined />}
            type="primary"
            loading={isSaving}
            onClick={async () => {
              if (!editableParticipation.author) {
                message.error("Bitte gib einen Namen an!");
                return;
              }
              setIsSaving(true);
              await saveParticipation(editableParticipation);
              setIsSaving(false);
              updateEditableParticipation(emptyEditableParticipation);
            }}
          >
            Antwort speichern
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export { PollResponsesMobile };

