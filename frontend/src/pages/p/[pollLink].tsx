import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { PollCommentArea } from "@components/PollCommentArea";
import { PollEditDialog } from "@components/PollEditDialog";
import { CREATE_OR_UPDATE_PARTICIPATION } from "@operations/mutations/CreateOrUpdateParticipation";
import { DELETE_PARTICIPATION } from "@operations/mutations/DeleteParticipation";
import {
  CreateOrUpdateParticipation,
  CreateOrUpdateParticipationVariables
} from "@operations/mutations/__generated__/CreateOrUpdateParticipation";
import {
  DeleteParticipation,
  DeleteParticipationVariables
} from "@operations/mutations/__generated__/DeleteParticipation";
import { GET_POLL_BY_LINK } from "@operations/queries/GetPollByLink";
import {
  GetPollByLink,
  GetPollByLink_getPollByLink_options,
  GetPollByLink_getPollByLink_participations,
  GetPollByLink_getPollByLink_participations_choices
} from "@operations/queries/__generated__/GetPollByLink";
import { useStyledMutation } from "@util/mutationWrapper";
import { removeTypenameFromObject } from "@util/removeTypenameFromObject";
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Input,
  message,
  PageHeader,
  Popconfirm,
  Space
} from "antd";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { PollOptionType, YesNoMaybe } from "__generated__/globalTypes";

type TAccumulatedChoicesPerOption = Record<
  string,
  { yes: number; no: number; maybe: number }
>;

const ParticipantRow = ({
  name: _name,
  editable = false,
  deletable = true,
  deleteConfirmation = true,
  className = "",
  onEditClick = () => {},
  onSaveClick = () => {},
  onDeleteClick = () => {},
}: {
  name: string;
  editable?: boolean;
  deletable?: boolean;
  deleteConfirmation?: boolean;
  className?: string;
  onEditClick?: () => any;
  onSaveClick?: (_newName: string) => any;
  onDeleteClick?: () => any;
}) => {
  const [name, setName] = useState(_name);

  return (
    <div className={`pollpage--participant ${className}`}>
      <div className="pollpage--participant-name">
        {editable ? (
          <Input
            style={{ width: "300px" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          name
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
        ) : (
          <Button icon={<EditOutlined />} onClick={() => onEditClick()} />
        )}
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
  const [participation, setParticipation] = useState(propParticipation);

  const mapChoiceToClassName = (c?: YesNoMaybe) => {
    switch (c) {
      case YesNoMaybe.Yes:
        return "pollpage--option-choice-yes";
      case YesNoMaybe.No:
        return "pollpage--option-choice-no";
      case YesNoMaybe.Maybe:
        return "pollpage--option-choice-maybe";
      default:
        return "pollpage--option-choice-unknown";
    }
  };

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

  const handleChoiceClick = (optionId: string) => {
    setParticipation((_participation) => {
      //TODO this object copy seems ugly, yet is necessary since _participations is frozen
      const oldChoices = _participation.choices.map((c) =>
        Object.assign({}, c)
      );

      const p = oldChoices.find((c) => c.option == optionId);
      if (p) {
        oldChoices
          .filter((c) => c.option == optionId)
          .forEach((c) => (c.choice = deriveNextChoiceFromCurrent(c.choice)));
      } else {
        oldChoices.push({
          option: optionId,
          choice: YesNoMaybe.Yes,
          __typename: "PollChoice",
        });
      }

      return { ..._participation, choices: oldChoices };
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
          <div
            key={idx}
            className={`${mapChoiceToClassName(p?.choice)} ${
              editable ? "pollpage--option-choice-editable" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              editable ? handleChoiceClick(p ? p.option : o._id) : null;
            }}
            onMouseDown={
              (e) =>
                e.preventDefault() /* prevent selecting text on page when double-clicking fast */
            }
          >
            {mapChoiceToIcon(p?.choice, editable)}
          </div>
        );
      })}
    </div>
  );
};

const PollPage: NextPage = () => {
  const router = useRouter();
  const { pollLink } = router.query;

  const [editableParticipation, setEditableParticipation] =
    useState<GetPollByLink_getPollByLink_participations | null>(null);
  const [participationBeingAdded, setParticipationBeingAdded] = useState<Omit<
    GetPollByLink_getPollByLink_participations,
    "_id" | "__typename"
  > | null>(null);
  const [isEditingPoll, setIsEditingPoll] = useState(false);

  const { error, loading, data } = useQuery<GetPollByLink>(GET_POLL_BY_LINK, {
    skip: !pollLink,
    variables: { pollLink },
  });
  const { getPollByLink: poll } = data || {};

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

  const createOrUpdateParticipationMutation = useStyledMutation<
    CreateOrUpdateParticipation,
    CreateOrUpdateParticipationVariables
  >(CREATE_OR_UPDATE_PARTICIPATION, { successMessage: "Antwort gespeichert!" });
  const saveParticipation = async (
    participation: Omit<
      GetPollByLink_getPollByLink_participations,
      "_id" | "__typename"
    > &
      Partial<Pick<GetPollByLink_getPollByLink_participations, "_id">>
  ) => {
    await createOrUpdateParticipationMutation({
      pollId: poll?._id ?? "",
      participation: {
        ...removeTypenameFromObject({ ...participation }),
        choices: participation.choices
          .map((n) => ({
            ...n,
            __typename: undefined,
          }))
          .filter((n) => poll?.options.some((o) => o._id == n.option)),
      },
    });
  };

  const deleteParticipationMutation = useStyledMutation<
    DeleteParticipation,
    DeleteParticipationVariables
  >(DELETE_PARTICIPATION, { successMessage: "Antwort gelöscht!" });
  const deleteParticipation = async (participationId: string) => {
    await deleteParticipationMutation(
      {
        pollId: poll?._id ?? "",
        participationId,
      },
      {
        update(cache) {
          const normalizedId = cache.identify({
            id: participationId,
            __typename: "PollParticipation",
          });
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      }
    );
  };

  if (loading || !poll) return <div>loading...</div>;
  if (error) return <div>An Error occured: {JSON.stringify(error)}</div>;

  let choiceCountPerOption = poll?.options.reduce(
    (map: TAccumulatedChoicesPerOption, o) => {
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
    },
    {}
  );

  return (
    <>
      <Head>
        <title>{poll.title} | DadleX</title>
      </Head>
      <PageHeader
        ghost={false}
        onBack={() => router.back()}
        title={poll?.title}
        subTitle={poll?.author}
        style={{ marginBottom: "16px" }}
        extra={
          <Button
            hidden={isEditingPoll}
            onClick={() => setIsEditingPoll(true)}
            icon={<EditOutlined />}
          />
        }
      >
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="Created">tbd</Descriptions.Item>
        </Descriptions>

        {isEditingPoll ? (
          <PollEditDialog
            title="Umfrage bearbeiten"
            poll={poll}
            saveButtonIcon={<SaveOutlined />}
            saveButtonContent="Änderungen speichern"
            onSaveSuccess={() => setIsEditingPoll(false)}
          />
        ) : null}
      </PageHeader>
      <Card>
        <div className="pollpage--container">
          <div className="pollpage--participants">
            {poll?.participations.map((p, idx) => (
              <ParticipantRow
                key={idx}
                name={p.author}
                editable={editableParticipation?._id == p._id}
                onEditClick={() => setEditableParticipation(p)}
                onSaveClick={async (e) => {
                  if (!editableParticipation) return;
                  await saveParticipation({
                    ...editableParticipation,
                    author: e,
                  });
                  setEditableParticipation(null);
                }}
                onDeleteClick={() => deleteParticipation(p._id)}
              />
            ))}
            {participationBeingAdded ? (
              <ParticipantRow
                name=""
                className="pollpage--participant-add-field-container"
                editable={true}
                deletable={true}
                deleteConfirmation={false}
                onSaveClick={async (e) => {
                  await saveParticipation({
                    ...participationBeingAdded,
                    author: e,
                  });
                  setParticipationBeingAdded(null);
                }}
                onDeleteClick={() => setParticipationBeingAdded(null)}
              />
            ) : (
              <div className="pollpage--add-btn-container">
                <Button
                  shape="circle"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setParticipationBeingAdded({
                      author: "",
                      choices: [],
                    })
                  }
                />
              </div>
            )}
          </div>
          <div className="pollpage--participations-container">
            <OptionsRow
              key="optionstitles"
              options={poll?.options || []}
              choiceCountPerOption={choiceCountPerOption}
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
      </Card>
      <PollCommentArea pollId={poll._id} comments={poll.comments} />
    </>
  );
};

export default PollPage;
