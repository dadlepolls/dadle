import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import produce from "immer";
import React, { useCallback, useState } from "react";
import { OptionsRow } from "./OptionsRow";
import { ParticipantRow } from "./ParticipantRow";
import { ParticipationRow } from "./ParticipationRow";
import {
  IPollParticipation,
  TPollParticipationWithOptionalId,
  TPollWithOptionalAvailabilityHint
} from "./PollTypes";
import { getChoiceCountPerOption, getEmptyEditableParticipation } from "./util";

const PollResponses = ({
  poll,
  saveParticipationFunction: saveParticipation = async () => {},
  deleteParticipationFunction: deleteParticipation = async () => {},
  readOnly = false,
  allowNameEditForNewParticipation = true,
  nameHint,
  onNameHintChange = () => {},
}: {
  poll: TPollWithOptionalAvailabilityHint;
  saveParticipationFunction?: (
    participation: TPollParticipationWithOptionalId
  ) => Promise<any>;
  deleteParticipationFunction?: (participationId: string) => Promise<any>;
  readOnly?: boolean;
  allowNameEditForNewParticipation?: boolean;
  nameHint?: string;
  onNameHintChange?: (newNameHint: string) => any;
}) => {
  const [editableParticipation, setEditableParticipation] =
    useState<IPollParticipation | null>(null);
  const [participationBeingAdded, setParticipationBeingAdded] = useState<Omit<
    IPollParticipation,
    "_id"
  > | null>(null);

  const onChoiceChangeCallbackEditing = useCallback(
    (c) =>
      setEditableParticipation((p) => {
        return p ? { ...p, choices: c } : null;
      }),
    [setEditableParticipation]
  );
  const onChoiceChangeCallbackAdding = useCallback(
    (c) =>
      setParticipationBeingAdded((p) => {
        return p ? { ...p, choices: c } : null;
      }),
    [setParticipationBeingAdded]
  );

  return (
    <div className="pollpage--container">
      <div className="pollpage--scroll-container">
        <div className="pollpage--participants-container">
          <div className="pollpage--participants">
            {poll?.participations.map((p, idx) => (
              <ParticipantRow
                key={idx}
                nameHint={p.participantName ?? nameHint ?? ""}
                editable={editableParticipation?._id == p._id}
                canEditName={p.allowNameEdit}
                onEditClick={() => setEditableParticipation(p)}
                allowEdit={!readOnly && p.allowEdit}
                onSaveClick={async (e) => {
                  if (!editableParticipation) return;
                  await saveParticipation(
                    produce(
                      editableParticipation,
                      (draft: Partial<IPollParticipation>) => {
                        draft.participantName = e;
                      }
                    )
                  );

                  setEditableParticipation(null);
                }}
                onDeleteClick={() => deleteParticipation(p._id)}
              />
            ))}
            {participationBeingAdded ? (
              <ParticipantRow
                nameHint={nameHint ?? ""}
                className="pollpage--participant-add-field-container"
                editable={true}
                deletable={true}
                deleteConfirmation={false}
                canEditName={allowNameEditForNewParticipation} //name is editable if user is not authenticated
                onSaveClick={async (e) => {
                  onNameHintChange(e);
                  await saveParticipation(
                    produce(
                      participationBeingAdded,
                      (draft: Partial<IPollParticipation>) => {
                        if (!draft) return;
                        draft.participantName = e;
                      }
                    )
                  );
                  setParticipationBeingAdded(null);
                }}
                onDeleteClick={() => setParticipationBeingAdded(null)}
              />
            ) : (
              <div className="pollpage--add-btn-container">
                {!readOnly ? (
                  <Button
                    shape="circle"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setParticipationBeingAdded(
                        getEmptyEditableParticipation(
                          allowNameEditForNewParticipation,
                          nameHint
                        )
                      )
                    }
                  />
                ) : (
                  <div></div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="pollpage--participations-container">
          <OptionsRow
            key="optionstitles"
            options={poll?.options || []}
            choiceCountPerOption={getChoiceCountPerOption(poll)}
          />
          <div className="pollpage--participations">
            {poll.participations.map((p, idx) => (
              <ParticipationRow
                key={idx}
                participation={p}
                options={poll.options}
                availabilityHints={poll.availabilityHints}
                editable={editableParticipation?._id == p._id}
                onChoiceChange={onChoiceChangeCallbackEditing}
              />
            ))}
            {participationBeingAdded ? (
              <ParticipationRow
                participation={participationBeingAdded}
                options={poll?.options}
                availabilityHints={poll.availabilityHints}
                editable={true}
                onChoiceChange={onChoiceChangeCallbackAdding}
              />
            ) : (
              <div className="pollpage--participation-choice-row pollpage--participation-choice-row-empty" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { PollResponses as Poll };

