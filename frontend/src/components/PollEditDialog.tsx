import { CloseOutlined, SettingOutlined } from "@ant-design/icons";
import { gql, useApolloClient } from "@apollo/client";
import { CREATE_OR_UPDATE_POLL } from "@operations/mutations/CreateOrUpdatePoll";
import {
  CreateOrUpdatePoll,
  CreateOrUpdatePollVariables,
  CreateOrUpdatePoll_createOrUpdatePoll,
} from "@operations/mutations/__generated__/CreateOrUpdatePoll";
import { CHECK_LINK_AVAILABILITY } from "@operations/queries/CheckLinkAvailability";
import {
  CheckLinkAvailability,
  CheckLinkAvailabilityVariables,
} from "@operations/queries/__generated__/CheckLinkAvailability";
import { GetPollByLink_getPollByLink } from "@operations/queries/__generated__/GetPollByLink";
import { useStyledMutation } from "@util/mutationWrapper";
import { Button, Card, Form, Input, Select } from "antd";
import produce from "immer";
import { useTranslation } from "next-i18next";
import { useCallback, useMemo, useState } from "react";
import { InputWithInlineComponent } from "./PollEditDialog/InputWithInlineComponent";
import { OptionEditor } from "./PollEditDialog/OptionEditor";
import {
  linkFromTitle,
  mapOptionTypeToEditorType,
  useWindowOrigin,
} from "./PollEditDialog/util";

export const PollEditDialog = ({
  poll: _poll,
  title,
  allowLinkEditing = true,
  saveButtonContent,
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
  const { t } = useTranslation("polleditor");
  const [form] = Form.useForm();

  const [linkModifiedManually, setLinkModifiedManually] = useState(
    !!_poll?.link
  ); //link is not marked as "modified manually" if there is not link given at the first place
  const [pollIsSaving, setPollIsSaving] = useState(false);
  //accordion with "advanced settings" is expanded
  const [advancedSettingsExpanded, setAdvancedSettingsExpanded] =
    useState(false);
  const windowOrigin = useWindowOrigin(); //URL origin of the window
  const apolloClient = useApolloClient();

  if (!saveButtonContent) saveButtonContent = t("save");

  const createOrUpdatePollMutation = useStyledMutation<
    CreateOrUpdatePoll,
    CreateOrUpdatePollVariables
  >(CREATE_OR_UPDATE_POLL, {
    statusCallbackFunction: setPollIsSaving,
    successMessage: t("save_success"),
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
      if ("linkMode" in draft) delete draft.linkMode;
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

  const autocreateLink = useMemo(
    () => (title: string) =>
      form.setFieldsValue({
        link: linkFromTitle(title),
      }),
    [form]
  );

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
          //show the advanced settings in case one of the options couldn't be validated
          else setAdvancedSettingsExpanded(false);
        }}
      >
        <Form.Item
          required={true}
          label={t("title")}
          name="title"
          rules={[
            {
              required: true,
              message: t("title_required_error"),
            },
          ]}
        >
          <InputWithInlineComponent
            compact
            placeholder={t("title")}
            style={{ width: "calc(100% - 32px)" }}
            onChange={(e) => {
              if (!linkModifiedManually) autocreateLink(e.target.value);
            }}
            inlineComponent={
              <Button
                onClick={() => setAdvancedSettingsExpanded((e) => !e)}
                icon={<SettingOutlined />}
              />
            }
          />
        </Form.Item>
        <Card
          size="small"
          title={t("advanced_settings")}
          style={{
            display: advancedSettingsExpanded ? undefined : "none",
            marginBottom: 24,
          }}
          extra={[
            <Button
              type="link"
              key="close_button"
              icon={<CloseOutlined className="close_button" />}
              onClick={() => setAdvancedSettingsExpanded(false)}
            />,
          ]}
        >
          <style key="style" jsx global>{`
            .close_button {
              color: rgba(0, 0, 0, 0.45);
            }
            .close_button:hover {
              color: rgba(0, 0, 0, 0.75);
            }
          `}</style>
          <Form.Item noStyle dependencies={["title", "linkMode"]}>
            {({ getFieldValue }) =>
              allowLinkEditing ? (
                <Form.Item
                  required={true}
                  label={t("link_description")}
                  name="link"
                  dependencies={["linkMode"]}
                  rules={[
                    {
                      required: true,
                      message: t("link_required_error"),
                    },
                    {
                      pattern: /^[\w-]+$/g,
                      message: t("link_invalid_error"),
                    },
                    {
                      validator: async (_, value) => {
                        if (value == "") return Promise.resolve();
                        if (await checkLinkAvailability(value))
                          return Promise.resolve();
                        else
                          return Promise.reject(
                            new Error(t("link_unavailable_error"))
                          );
                      },
                    },
                  ]}
                >
                  <Input
                    type="text"
                    addonBefore={
                      <Form.Item name="linkMode" noStyle initialValue={"auto"}>
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
                            {t("link_autocreate")}
                          </Select.Option>
                          <Select.Option value="manual">
                            {t("link_manual")}
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    }
                    disabled={getFieldValue("linkMode") == "auto"}
                    placeholder={t("link_description")}
                    prefix={`${windowOrigin}/p/`}
                    onChange={() => {
                      if (!linkModifiedManually) setLinkModifiedManually(true);
                    }}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Card>
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
