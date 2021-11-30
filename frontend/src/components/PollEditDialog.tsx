import { PlusOutlined } from "@ant-design/icons";
import { ApolloError, gql, useMutation } from "@apollo/client";
import { CREATE_OR_UPDATE_POLL } from "@operations/mutations/CreateOrUpdatePoll";
import { CreateOrUpdatePoll } from "@operations/mutations/__generated__/CreateOrUpdatePoll";
import { CreatePoll_createPoll } from "@operations/mutations/__generated__/CreatePoll";
import { GetPollByLink_getPollByLink } from "@operations/queries/__generated__/GetPollByLink";
import { Button, Card, Collapse, Form, Input, message } from "antd";
import moment from "moment";
import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { PollOptionType } from "__generated__/globalTypes";
import { OptionEditor } from "./PollEditDialog/OptionEditor";

const autocreateLinkFromTitle = (title: string) => {
  return title
    .replaceAll(" ", "-")
    .replaceAll("ä", "ae")
    .replaceAll("Ä", "AE")
    .replaceAll("ö", "oe")
    .replaceAll("Ö", "OE")
    .replaceAll("ü", "ue")
    .replaceAll("Ü", "UE")
    .replaceAll(/(?![\w-])./g, "");
};

const sortPollOptions = (poll: Partial<CreatePoll_createPoll>) => {
  const { options: originalOptions, ...pollData } = poll;
  const options = [...(originalOptions || [])].sort((a, b) => {
    if (
      a.type == PollOptionType.Arbitrary &&
      b.type == PollOptionType.Arbitrary
    )
      return 0;
    if (a.type == PollOptionType.Arbitrary) return -1;
    if (b.type == PollOptionType.Arbitrary) return 1;
    if (!a.from || !b.from) return 0;
    return moment(a.from).diff(moment(b.from));
  });
  return { ...pollData, options };
};

export const PollEditDialog = ({
  poll: _poll,
  title,
}: {
  poll?: Partial<GetPollByLink_getPollByLink>;
  title: string;
}) => {
  const [form] = Form.useForm();
  const router = useRouter();

  const [linkModifiedManually, setLinkModifiedManually] = useState(
    !!_poll?.link
  ); //link is not marked as "modified manually" if there is not link given at the first place
  const [pollIsSaving, setPollIsSaving] = useState(false);

  const [createPollMutation] = useMutation<CreateOrUpdatePoll>(
    CREATE_OR_UPDATE_POLL,
    {
      update(cache, { data }) {
        cache.modify({
          fields: {
            getPolls(existingPolls = []) {
              const newPollRef = cache.readFragment({
                id: `Poll:${data?.createOrUpdatePoll._id}`,
                fragment: gql`
                  fragment NewPoll on Poll {
                    _id
                    title
                    link
                    author
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

  const savePoll = async (poll: Partial<CreatePoll_createPoll>) => {
    setPollIsSaving(true);
    try {
      await createPollMutation({
        variables: {
          poll: sortPollOptions(poll),
        },
      });
      message.success("Umfrage gespeichert!");
    } catch (ex) {
      let additionalMessage;
      if (ex instanceof ApolloError) {
        additionalMessage = (
          <>
            <br />
            <small>{ex.message}</small>
          </>
        );
      }
      message.error(
        <>
          <span>Speichern fehlgeschlagen!</span>
          {additionalMessage}
        </>
      );
    } finally {
      setPollIsSaving(false);
      router.push(`/p/${poll.link}`);
    }
  };

  return (
    <Card style={{ width: "100%" }} title={title}>
      <Form
        form={form}
        initialValues={_poll}
        layout="horizontal"
        onFinish={(e) => savePoll(e)}
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
              if (!linkModifiedManually)
                form.setFieldsValue({
                  link: autocreateLinkFromTitle(e.target.value),
                });
            }}
          />
        </Form.Item>
        <Form.Item noStyle dependencies={["title"]}>
          {({ getFieldValue }) =>
            getFieldValue("title") ? (
              <Collapse ghost>
                <Collapse.Panel
                  key="1"
                  header="Erweiterte Einstellungen"
                  forceRender={true}
                >
                  <Form.Item
                    required={true}
                    label="Link zur Umfrage"
                    name="link"
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
                    ]}
                  >
                    <Input
                      type="text"
                      addonBefore="http://dadlelink/p/" /*TODO get hostname dynamically */
                      placeholder="Link zur Umfrage"
                      onChange={() => {
                        if (!linkModifiedManually)
                          setLinkModifiedManually(true);
                      }}
                    />
                  </Form.Item>
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
            icon={<PlusOutlined />}
            loading={pollIsSaving}
            style={{ float: "right", marginTop: 16 }}
          >
            Umfrage erstellen
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
