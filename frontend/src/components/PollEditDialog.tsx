import { DeleteOutlined } from "@ant-design/icons";
import { ApolloError, gql, useMutation } from "@apollo/client";
import { CREATE_POLL } from "@operations/mutations/CreateOrUpdateComment copy";
import {
  CreatePoll,
  CreatePoll_createPoll
} from "@operations/mutations/__generated__/CreatePoll";
import {
  GetPollByLink_getPollByLink,
  GetPollByLink_getPollByLink_options
} from "@operations/queries/__generated__/GetPollByLink";
import { Button, Card, Form, Input, message, Radio } from "antd";
import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { PollOptionType } from "__generated__/globalTypes";

const OptionEditorArbitrary = ({
  value = [],
  onChange = () => {},
}: {
  value?: Partial<GetPollByLink_getPollByLink_options>[];
  onChange?: (value: Partial<GetPollByLink_getPollByLink_options>[]) => any;
}) => {
  return (
    <>
      {[...value, {}].map((o, idx, arr) => (
        <Input.Group key={idx} style={{ marginTop: 4 }}>
          <Input
            type="text"
            style={{ width: "calc(100% - 32px)" }}
            placeholder={idx == arr.length - 1 ? "Option hinzufügen" : "Option"}
            value={o.title || ""}
            onChange={(e) => {
              const opts = [...value];
              opts[idx] = {
                ...opts[idx],
                type: PollOptionType.Arbitrary,
                title: e.target.value,
              };
              onChange(opts);
            }}
          />
          {idx < arr.length - 1 ? (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                const opts = [...value];
                opts.splice(idx, 1);
                onChange(opts);
              }}
            />
          ) : null}
        </Input.Group>
      ))}
    </>
  );
};

const OptionEditorFormItem = () => {
  return (
    <Form.Item
      name="options"
      rules={[
        {
          validator: (
            _,
            val: Partial<GetPollByLink_getPollByLink_options>[]
          ) => {
            if (val.some((v) => !v.title))
              return Promise.reject(
                new Error("Es muss für alle Optionen ein Name vergeben sein!")
              );
            if (val.length == 0)
              return Promise.reject(
                new Error(
                  "Es muss mindestens eine Umfrageoption angelegt angelegt sein!"
                )
              );
            return Promise.resolve();
          },
        },
      ]}
    >
      <OptionEditorArbitrary />
    </Form.Item>
  );
};

const OptionEditor = ({
  options,
}: {
  options?: GetPollByLink_getPollByLink_options[];
}) => {
  const [pollOptionType, setPollOptionType] = useState(
    options?.length ? options[0].type : null
  );

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Radio.Group
        buttonStyle="solid"
        value={pollOptionType}
        onChange={(e) => setPollOptionType(e.target.value)}
        disabled={
          options && options.filter((o) => o.type == pollOptionType).length > 0
        } /* disabled in case there are any options specified */
      >
        <Radio.Button value={PollOptionType.DateTime}>
          Ein Datum und eine Uhrzeit finden
        </Radio.Button>
        <Radio.Button value={PollOptionType.Date}>
          Ein Datum finden
        </Radio.Button>
        <Radio.Button value={PollOptionType.Arbitrary}>
          Über beliebige Optionen abstimmen
        </Radio.Button>
      </Radio.Group>
      <div style={{ width: "100%", marginTop: 16 }}>
        {pollOptionType == PollOptionType.Arbitrary ? (
          <OptionEditorFormItem />
        ) : null}
      </div>
    </div>
  );
};

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

  const [createPollMutation] = useMutation<CreatePoll>(CREATE_POLL, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          getPolls(existingPolls = []) {
            const newPollRef = cache.readFragment({
              id: `Poll:${data?.createPoll._id}`,
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
  });

  const savePoll = async (poll: Partial<CreatePoll_createPoll>) => {
    setPollIsSaving(true);
    try {
      await createPollMutation({
        variables: {
          poll,
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
        layout="vertical"
        onFinish={(e) => savePoll(e)}
      >
        <Form.Item required={true} label="Name der Umfarge" name="title">
          <Input
            type="text"
            size="large"
            placeholder="Name der Umfrage"
            onChange={(e) => {
              if (!linkModifiedManually)
                form.setFieldsValue({
                  link: autocreateLinkFromTitle(e.target.value),
                });
            }}
          />
        </Form.Item>
        <Form.Item
          required={true}
          label="Link zur Umfrage"
          name="link"
          rules={[
            {
              required: true,
              message: "Es muss ein Link für die Umfrage angegeben werden!",
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
              if (!linkModifiedManually) setLinkModifiedManually(true);
            }}
          />
        </Form.Item>
        <OptionEditor options={_poll?.options} />
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={pollIsSaving}>
            Umfrage erstellen
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
