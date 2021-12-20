import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { useAuth } from "@components/AuthContext";
import {
  GetPollByLink_getPollByLink,
  GetPollByLink_getPollByLink_options,
  GetPollByLink_getPollByLink_participations,
  GetPollByLink_getPollByLink_participations_choices
} from "@operations/queries/__generated__/GetPollByLink";
import { Button, Checkbox, Input, message, Popconfirm, Space } from "antd";
import produce from "immer";
import * as ls from "local-storage";
import React, { useCallback, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import {
  PollOptionType,
  PollParticipationInput,
  YesNoMaybe
} from "__generated__/globalTypes";

type TAccumulatedChoicesPerOption = Record<
  string,
  { yes: number; no: number; maybe: number }
>;

type TPartialParticipationWithId = Omit<
  GetPollByLink_getPollByLink_participations,
  "_id" | "__typename"
> &
  Partial<Pick<GetPollByLink_getPollByLink_participations, "_id">>;

const getChoiceCountPerOption = (
  poll: GetPollByLink_getPollByLink | undefined | null
): TAccumulatedChoicesPerOption => {
  return (
    poll?.options.reduce((map: TAccumulatedChoicesPerOption, o) => {
      const getAmountOfResponsesForChoice = (choice: YesNoMaybe) =>
        poll?.participations.filter((p) =>
          p.choices.some((c) => c.option == o._id && c.choice == choice)
        ).length;
      map[o._id] = {
        yes: getAmountOfResponsesForChoice(YesNoMaybe.Yes),
        no: getAmountOfResponsesForChoice(YesNoMaybe.No),
        maybe: getAmountOfResponsesForChoice(YesNoMaybe.Maybe),
      };
      return map;
    }, {}) || {}
  );
};

const ParticipantRow = ({
  nameHint,
  editable = false,
  deletable = true,
  deleteConfirmation = true,
  className = "",
  allowEdit = true,
  canEditName = true,
  onEditClick = () => {},
  onSaveClick = () => {},
  onDeleteClick = () => {},
}: {
  nameHint: string;
  editable?: boolean;
  deletable?: boolean;
  deleteConfirmation?: boolean;
  className?: string;
  allowEdit?: boolean;
  canEditName?: boolean;
  onEditClick?: () => any;
  onSaveClick?: (_newName: string) => any;
  onDeleteClick?: () => any;
}) => {
  const [name, setName] = useState(nameHint);

  return (
    <div className={`pollpage--participant ${className}`}>
      <div className="pollpage--participant-name">
        {editable && canEditName ? (
          <Input
            style={{ width: "300px" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          nameHint
        )}
      </div>
      <div className="pollpage--participant-action-btn">
        {editable ? (
          <Space>
            {deletable ? (
              deleteConfirmation ? (
                <Popconfirm
                  title="Soll die Antwort wirklich gelöscht werden?"
                  okText="Ja"
                  cancelText="Abbrechen"
                  onConfirm={() => onDeleteClick()}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ) : (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteClick()}
                />
              )
            ) : null}
            <Button
              type="primary"
              onClick={() => {
                if (!name) message.error("Bitte gib einen Namen an!");
                else onSaveClick(name);
              }}
              icon={<SaveOutlined />}
            />
          </Space>
        ) : allowEdit ? (
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setName(nameHint);
              onEditClick();
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

const OptionTitle = ({
  option,
  badgeContent,
}: {
  option: GetPollByLink_getPollByLink_options;
  badgeContent?: string;
}) => {
  const content = [];

  const from = option.from ? new Date(option.from) : null;
  const to = option.to ? new Date(option.to) : null;

  const padToTwoDigits = (n?: number) => String(n).padStart(2, "0");

  if (
    option.type == PollOptionType.Date ||
    option.type == PollOptionType.DateTime
  ) {
    content.push(
      <span key="weekday" className="pollpage--participation-option-weekday">
        {from?.toLocaleDateString(undefined, { weekday: "short" })}
      </span>
    );
    content.push(
      <span key="day" className="pollpage--participation-option-day">
        {from?.getDate()}
      </span>
    );
    content.push(
      <span key="month" className="pollpage--participation-option-month">
        {from?.toLocaleDateString(undefined, { month: "short" })}
      </span>
    );
  }
  if (option.type == PollOptionType.DateTime) {
    content.push(
      <span key="times" className="pollpage--participation-option-times">
        <span>
          {padToTwoDigits(from?.getHours())}
          <sup>{padToTwoDigits(from?.getMinutes())}</sup>
        </span>
        <span>
          {padToTwoDigits(to?.getHours())}
          <sup>{padToTwoDigits(to?.getMinutes())}</sup>
        </span>
      </span>
    );
  }
  if (option.type == PollOptionType.Arbitrary) {
    content.push(<span key="arb">{option.title}</span>);
  }

  return (
    <div className="pollpage--participation-option">
      {badgeContent ? (
        <span className="pollpage--participation-option-badge">
          {badgeContent}
        </span>
      ) : null}
      {content}
    </div>
  );
};

const OptionsRow = ({
  options,
  choiceCountPerOption = {},
}: {
  options: GetPollByLink_getPollByLink_options[];
  choiceCountPerOption?: TAccumulatedChoicesPerOption;
}) => {
  return (
    <div className="pollpage--participation-option-row">
      {options.map((o, idx) => (
        <OptionTitle
          option={o}
          key={idx}
          badgeContent={
            choiceCountPerOption[o._id]?.yes
              ? String(choiceCountPerOption[o._id]?.yes)
              : undefined
          }
        />
      ))}
    </div>
  );
};

const mapChoiceToColorVariable = (c?: YesNoMaybe) => {
  switch (c) {
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

const ParticipationChoiceCell = ({
  editable = false,
  choice,
  onClick = () => {},
}: {
  editable?: boolean;
  choice?: YesNoMaybe;
  onClick?: () => any;
}) => {
  const mapChoiceToIcon = (c?: YesNoMaybe, editable: boolean = false) => {
    switch (c) {
      case YesNoMaybe.Yes:
        return <CheckCircleOutlined />;
      case YesNoMaybe.No:
        return <CloseCircleOutlined />;
      case YesNoMaybe.Maybe:
        return <QuestionCircleOutlined />;
      default:
        return editable ? <Checkbox /> : <></>;
    }
  };

  return (
    <div
      className={`${editable ? "pollpage--option-choice-editable" : ""}`}
      style={{
        backgroundColor: `var(${mapChoiceToColorVariable(choice)})`,
      }}
      onClick={(e) => {
        e.preventDefault();
        editable ? onClick() : null;
      }}
      onMouseDown={
        (e) =>
          e.preventDefault() /* prevent selecting text on page when double-clicking fast */
      }
    >
      {mapChoiceToIcon(choice, editable)}
    </div>
  );
};

const deriveNextChoiceFromCurrent = (currentChoice: YesNoMaybe) => {
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

const ParticipationRow = ({
  options,
  participation: propParticipation,
  editable = false,
  onChoiceChange = () => {},
}: {
  options: GetPollByLink_getPollByLink_options[];
  participation: Omit<
    GetPollByLink_getPollByLink_participations,
    "_id" | "__typename"
  >;
  editable?: boolean;
  onChoiceChange?: (
    newChoices: GetPollByLink_getPollByLink_participations_choices[]
  ) => any;
}) => {
  const [participation, updateParticipation] = useImmer(propParticipation);

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
          choice: YesNoMaybe.Yes,
          __typename: "PollChoice",
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
            editable={editable}
            onClick={() => handleChoiceClick(o._id)}
          />
        );
      })}
    </div>
  );
};

const PollResponses = ({
  poll,
  saveParticipationFunction: saveParticipation = async () => {},
  deleteParticipationFunction: deleteParticipation = async () => {},
  readOnly = false,
}: {
  poll: GetPollByLink_getPollByLink;
  saveParticipationFunction?: (
    participation: TPartialParticipationWithId
  ) => Promise<any>;
  deleteParticipationFunction?: (participationId: string) => Promise<any>;
  readOnly?: boolean;
}) => {
  const [editableParticipation, setEditableParticipation] =
    useState<GetPollByLink_getPollByLink_participations | null>(null);
  const [participationBeingAdded, setParticipationBeingAdded] = useState<Omit<
    GetPollByLink_getPollByLink_participations,
    "_id" | "__typename"
  > | null>(null);
  const { user } = useAuth();

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
      <div className="pollpage--participants">
        {poll?.participations.map((p, idx) => (
          <ParticipantRow
            key={idx}
            nameHint={
              p.author.user?.name ||
              p.author.anonName ||
              ls.get<string>("username")
            }
            editable={editableParticipation?._id == p._id}
            canEditName={!editableParticipation?.author.user?._id}
            onEditClick={() => setEditableParticipation(p)}
            allowEdit={
              !readOnly &&
              (!p.author.user?._id || p.author.user._id == user?._id)
            }
            onSaveClick={async (e) => {
              if (!editableParticipation) return;
              await saveParticipation(
                produce(
                  editableParticipation,
                  (
                    draft: Partial<typeof editableParticipation> &
                      PollParticipationInput
                  ) => {
                    delete draft.author;
                    if (!p.author.anonName)
                      draft.anonName = user?._id ? undefined : e;
                    else draft.anonName = e;
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
            nameHint={user?.name ?? ls.get("username") ?? ""}
            className="pollpage--participant-add-field-container"
            editable={true}
            deletable={true}
            deleteConfirmation={false}
            canEditName={!user?._id}
            onSaveClick={async (e) => {
              ls.set("username", e);
              await saveParticipation(
                produce(
                  participationBeingAdded,
                  (
                    draft: Partial<typeof editableParticipation> &
                      PollParticipationInput
                  ) => {
                    delete draft.author;
                    draft.anonName = user?._id ? undefined : e;
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
                  setParticipationBeingAdded({
                    author: {
                      anonName: ls.get<string>("username"),
                      __typename: "UserOrAnon",
                      user: null,
                    },
                    choices: [],
                  })
                }
              />
            ) : (
              <div></div>
            )}
          </div>
        )}
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
              editable={editableParticipation?._id == p._id}
              onChoiceChange={onChoiceChangeCallbackEditing}
            />
          ))}
          {participationBeingAdded ? (
            <ParticipationRow
              participation={participationBeingAdded}
              options={poll?.options}
              editable={true}
              onChoiceChange={onChoiceChangeCallbackAdding}
            />
          ) : (
            <div className="pollpage--participation-choice-row pollpage--participation-choice-row-empty" />
          )}
        </div>
      </div>
    </div>
  );
};

export {
  PollResponses,
  getChoiceCountPerOption,
  ParticipationChoiceCell,
  deriveNextChoiceFromCurrent,
  mapChoiceToColorVariable,
};
export type { TPartialParticipationWithId };

