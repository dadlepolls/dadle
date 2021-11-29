import { DeleteOutlined } from "@ant-design/icons";
import { GetPollByLink_getPollByLink_options } from "@operations/queries/__generated__/GetPollByLink";
import { Button, Form, Input, Radio, Tooltip } from "antd";
import React, { useState } from "react";
import { PollOptionType } from "__generated__/globalTypes";

const OptionEditorArbitrary = ({
  value = [], onChange = () => { },
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
            }} />
          {idx < arr.length - 1 ? (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                const opts = [...value];
                opts.splice(idx, 1);
                onChange(opts);
              }} />
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
export const OptionEditor = ({
  options,
}: {
  options?: GetPollByLink_getPollByLink_options[];
}) => {
  const [pollOptionType, setPollOptionType] = useState(
    options?.length ? options[0].type : null
  );

  /* disabled type change in case there are any options specified */
  const typeChangeDisabled = options && options.filter((o) => o.type == pollOptionType).length > 0;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Tooltip
        title={typeChangeDisabled ? (
          <>
            Die Art der Umfrage kann nicht geändert werden, wenn schon
            Antwortoptionen angegeben wurden.
            <br />
            Bitte lösche zuerst die Antwortoptionen.
          </>
        ) : null}
      >
        <Radio.Group
          buttonStyle="solid"
          value={pollOptionType}
          onChange={(e) => setPollOptionType(e.target.value)}
          disabled={typeChangeDisabled}
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
      </Tooltip>
      <div style={{ width: "100%", marginTop: 16 }}>
        {pollOptionType == PollOptionType.Arbitrary ? (
          <OptionEditorFormItem />
        ) : null}
      </div>
    </div>
  );
};
