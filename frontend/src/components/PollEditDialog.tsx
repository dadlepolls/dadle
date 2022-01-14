import { gql, useApolloClient } from "@apollo/client";
import { CREATE_OR_UPDATE_POLL } from "@operations/mutations/CreateOrUpdatePoll";
import {
  CreateOrUpdatePoll,
  CreateOrUpdatePollVariables,
  CreateOrUpdatePoll_createOrUpdatePoll
} from "@operations/mutations/__generated__/CreateOrUpdatePoll";
import { CHECK_LINK_AVAILABILITY } from "@operations/queries/CheckLinkAvailability";
import {
  CheckLinkAvailability,
  CheckLinkAvailabilityVariables
} from "@operations/queries/__generated__/CheckLinkAvailability";
import { GetPollByLink_getPollByLink } from "@operations/queries/__generated__/GetPollByLink";
import { useStyledMutation } from "@util/mutationWrapper";
import { Button, Card, Collapse, Form, Input, Select } from "antd";
import produce from "immer";
import React, { useCallback, useState } from "react";
import { PollOptionType } from "__generated__/globalTypes";
import { OptionEditor, OptionEditorType } from "./PollEditDialog/OptionEditor";

const mapOptionTypeToEditorType = (t?: PollOptionType) => {
  if (t == PollOptionType.Arbitrary) return OptionEditorType.Arbitrary;
  else if (t) return OptionEditorType.Calendar;
  else return null;
};

const getWindowOrigin = () =>
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "";

export const PollEditDialog = ({
  poll: _poll,
  title,
  allowLinkEditing = true,
  saveButtonContent = "Speichern",
  saveButtonIcon,
  onSaveSuccess = (_) => {},
  onSaveFailure = () => {},
}: {
  poll?: Partial<GetPollByLink_getPollByLink>;
  title: string;
  allowLinkEditing?: boolean;
  saveButtonIcon?: JSX.Element;
  saveButtonContent?: JSX.Element | string;
  onSaveSuccess?: (poll?: CreateOrUpdatePoll_createOrUpdatePoll) => any;
  onSaveFailure?: () => any;
}) => {
  const [form] = Form.useForm();

  const [linkModifiedManually, setLinkModifiedManually] = useState(
    !!_poll?.link
  ); //link is not marked as "modified manually" if there is not link given at the first place
  const [pollIsSaving, setPollIsSaving] = useState(false);
  //accordion with "advanced settings" is expanded
  const [advancedSettingsExpanded, setAdvancedSettingsExpanded] =
    useState(false);

  const apolloClient = useApolloClient();

  const createOrUpdatePollMutation = useStyledMutation<
    CreateOrUpdatePoll,
    CreateOrUpdatePollVariables
  >(CREATE_OR_UPDATE_POLL, {
    statusCallbackFunction: setPollIsSaving,
    successMessage: "Umfrage gespeichert!",
    onSuccess: (r) => onSaveSuccess(r?.createOrUpdatePoll),
    onError: onSaveFailure,
  });

  const savePoll = async (
    _poll: Partial<CreateOrUpdatePoll_createOrUpdatePoll> & {
      linkMode?: string;
    } & { __typename?: string }
  ) => {
    const poll = produce(_poll, (draft) => {
      if ("__typename" in draft) delete draft.__typename;
      if ("linkMode" in draft) {
        if (draft.linkMode == "auto") draft.link = undefined;
        delete draft.linkMode;
      }
    });

    await createOrUpdatePollMutation(
      {
        poll: {
          title: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          ...poll,
          options:
            poll.options?.map((o) => {
              //omit typename key for each option
              const { __typename, ...rest } = o;
              return rest;
            }) || [],
        },
      },
      {
        update(cache, { data }) {
          cache.modify({
            fields: {
              getPolls(existingPolls: { __ref: string }[] = []) {
                const fragmentId = `Poll:${data?.createOrUpdatePoll._id}`;
                //dont update cache in case the fragment definition already exists
                if (existingPolls.some((p) => p.__ref == fragmentId))
                  return existingPolls;
                const newPollRef = cache.readFragment({
                  id: fragmentId,
                  fragment: gql`
                    fragment NewPoll on Poll {
                      _id
                      title
                      link
                      author {
                        anonName
                        user {
                          _id
                          name
                        }
                      }
                    }
                  `,
                });
                return [...existingPolls, newPollRef];
              },
            },
          });
        },
      }
    );
  };

  const checkLinkAvailability = useCallback(
    async (link: string) => {
      const response = await apolloClient.query<
        CheckLinkAvailability,
        CheckLinkAvailabilityVariables
      >({
        query: CHECK_LINK_AVAILABILITY,
        fetchPolicy: "network-only",
        variables: {
          link,
        },
      });
      return response.data.checkPollLinkAvailability;
    },
    [apolloClient]
  );

  const autocreateLink = (title: string) => {
    form.setFieldsValue({
      link: title
        .replaceAll(" ", "-")
        .replaceAll("ä", "ae")
        .replaceAll("Ä", "AE")
        .replaceAll("ö", "oe")
        .replaceAll("Ö", "OE")
        .replaceAll("ü", "ue")
        .replaceAll("Ü", "UE")
        .replaceAll(/(?![\w-])./g, ""),
    });
  };

  return (
    <Card style={{ width: "100%" }} title={title}>
      <Form
        form={form}
        initialValues={{
          ..._poll,
          editorType: mapOptionTypeToEditorType(
            _poll?.options?.length ? _poll.options[0].type : undefined
          ),
        }}
        layout="horizontal"
        onFinish={(e) => {
          const { editorType, ...newPollData } = e; //omit editor type, since it's a form key but not required for poll
          savePoll({ _id: _poll?._id, ...newPollData });
        }}
        onFinishFailed={({ errorFields }) => {
          if (
            errorFields.some((field) =>
              field.name.some((name) => name == "link")
            )
          )
            setAdvancedSettingsExpanded(true);
          else setAdvancedSettingsExpanded(false);
        }}
      >
        <Form.Item
          required={true}
          label="Name der Umfrage"
          name="title"
          style={{ marginBottom: 0 }}
          rules={[
            {
              required: true,
              message: "Es muss ein Name für die Umfrage angegeben werden",
            },
          ]}
        >
          <Input
            type="text"
            placeholder="Name der Umfrage"
            onChange={(e) => {
              if (!linkModifiedManually) autocreateLink(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item noStyle dependencies={["title", "linkMode"]}>
          {({ getFieldValue }) =>
            getFieldValue("title") ? (
              <Collapse
                ghost
                accordion
                activeKey={advancedSettingsExpanded ? "1" : undefined}
                onChange={(k) => setAdvancedSettingsExpanded(!!k)}
              >
                <Collapse.Panel
                  key="1"
                  header="Erweiterte Einstellungen"
                  forceRender={true}
                >
                  {allowLinkEditing ? (
                    <Form.Item
                      required={true}
                      label="Link zur Umfrage"
                      name="link"
                      dependencies={["linkMode"]}
                      rules={[
                        {
                          required: true,
                          message:
                            "Es muss ein Link für die Umfrage angegeben werden!",
                        },
                        {
                          pattern: /^[\w-]+$/g,
                          message:
                            "Der Link darf nur Buchstaben, Zahlen, Bindestriche und Unterstriche enthalten!",
                        },
                        {
                          validator: async (_, value) => {
                            if (await checkLinkAvailability(value))
                              return Promise.resolve();
                            else
                              return Promise.reject(
                                new Error(
                                  "Der Link ist schon vergeben, bitte wähle einen anderen!"
                                )
                              );
                          },
                        },
                      ]}
                    >
                      <Input
                        type="text"
                        addonBefore={
                          <Form.Item
                            name="linkMode"
                            noStyle
                            initialValue={"auto"}
                          >
                            <Select
                              onChange={(opt) => {
                                if (opt == "auto") {
                                  //reset link when changing to auto
                                  setLinkModifiedManually(false);
                                  autocreateLink(getFieldValue("title"));
                                }
                              }}
                            >
                              <Select.Option value="auto">
                                Automatisch erzeugen
                              </Select.Option>
                              <Select.Option value="manual">
                                Link anpassen
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        }
                        disabled={getFieldValue("linkMode") == "auto"}
                        placeholder="Link zur Umfrage"
                        prefix={`${getWindowOrigin()}/p/`}
                        onChange={() => {
                          if (!linkModifiedManually)
                            setLinkModifiedManually(true);
                        }}
                      />
                    </Form.Item>
                  ) : null}
                </Collapse.Panel>
              </Collapse>
            ) : null
          }
        </Form.Item>

        <Form.Item noStyle dependencies={["options", "title"]}>
          {({ getFieldValue }) =>
            getFieldValue("title") ? (
              <OptionEditor
                pollTitle={getFieldValue("title")}
                options={getFieldValue("options")}
              />
            ) : null
          }
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={saveButtonIcon}
            loading={pollIsSaving}
            style={{ float: "right", marginTop: 16 }}
          >
            {saveButtonContent}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
