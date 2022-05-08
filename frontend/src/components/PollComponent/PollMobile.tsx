import { SaveOutlined } from "@ant-design/icons";
import { Button, Col, Input, message, Row } from "antd";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useImmer } from "use-immer";
import { OptionRowMobile } from "./OptionRowMobile";
import {
  IPoll,
  IPollWithAvailabilityHint,
  TPollParticipationWithOptionalId
} from "./PollTypes";
import {
  deriveNextChoiceFromCurrent,
  determineAvailabilitySuggestion,
  getChoiceCountPerOption,
  getEmptyEditableParticipation
} from "./util";

const PollResponsesMobile = ({
  poll,
  saveParticipationFunction: saveParticipation,
  allowNameEditForNewParticipation,
  nameHint,
  onNameHintChange = () => {},
}: {
  poll: IPoll & Partial<IPollWithAvailabilityHint>;
  saveParticipationFunction: (
    participation: TPollParticipationWithOptionalId
  ) => Promise<any>;
  deleteParticipationFunction: (participationId: string) => Promise<any>;
  allowNameEditForNewParticipation: boolean;
  nameHint?: string;
  onNameHintChange?: (newNameHint: string) => any;
}) => {
  const { t } = useTranslation("pollresponses");
  const [editableParticipation, updateEditableParticipation] =
    useImmer<TPollParticipationWithOptionalId>(
      getEmptyEditableParticipation(allowNameEditForNewParticipation, nameHint)
    );

  const [isSaving, setIsSaving] = useState(false);

  const responsesPerChoice = getChoiceCountPerOption(poll);

  return (
    <div className="pollpage-mobile--options">
      {poll.options.map((option, idx) => (
        <OptionRowMobile
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
                  choice: determineAvailabilitySuggestion(
                    poll.availabilityHints?.find((h) => h.option == option._id)
                      ?.overlappingEvents
                  ),
                  option: option._id,
                });
            })
          }
        />
      ))}
      <Row style={{ marginTop: 16 }} gutter={[8, 8]}>
        <Col flex="auto">
          {allowNameEditForNewParticipation ? (
            <Input
              type="text"
              placeholder="Name"
              value={editableParticipation.participantName ?? ""}
              onChange={(e) =>
                updateEditableParticipation((p) => {
                  p.participantName = e.target.value;
                })
              }
            />
          ) : null}
        </Col>
        <Col>
          <Button
            icon={<SaveOutlined />}
            type="primary"
            loading={isSaving}
            onClick={async () => {
              if (!editableParticipation.participantName) {
                message.error(t("error_name_required"));
                return;
              }
              setIsSaving(true);
              if (!editableParticipation._id)
                onNameHintChange(editableParticipation.participantName ?? "");
              await saveParticipation(editableParticipation);
              setIsSaving(false);
              updateEditableParticipation(
                getEmptyEditableParticipation(
                  allowNameEditForNewParticipation,
                  nameHint
                )
              );
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

