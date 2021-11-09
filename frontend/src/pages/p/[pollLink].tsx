import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { GET_POLL_BY_LINK } from "@operations/queries/GetPollByLink";
import {
  GetPollByLink,
  GetPollByLink_getPollByLink_options,
  GetPollByLink_getPollByLink_participations
} from "@operations/queries/__generated__/GetPollByLink";
import { Card, Descriptions, PageHeader } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { PollOptionType, YesNoMaybe } from "__generated__/globalTypes";

const ParticipantRow = ({ name }: { name: string }) => {
  return (
    <div className="pollpage--participant">
      <div className="pollpage--participant-name">{name}</div>
      <div className="pollpage--participant-edit-btn">
        <EditOutlined />
      </div>
    </div>
  );
};

const OptionTitle = ({
  option,
}: {
  option: GetPollByLink_getPollByLink_options;
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
        {from?.getDay()}
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

  return <div className="pollpage--participation-option">{content}</div>;
};

const OptionsRow = ({
  options,
}: {
  options: GetPollByLink_getPollByLink_options[];
}) => {
  return (
    <div className="pollpage--participation-option-row">
      {options.map((o, idx) => (
        <OptionTitle option={o} key={idx} />
      ))}
    </div>
  );
};

const ParticipationRow = ({
  options,
  participation,
}: {
  options: GetPollByLink_getPollByLink_options[];
  participation: GetPollByLink_getPollByLink_participations;
}) => {
  const mapChoiceToClassName = (c: YesNoMaybe) => {
    switch (c) {
      case YesNoMaybe.Yes:
        return "pollpage--option-choice-yes";
      case YesNoMaybe.No:
        return "pollpage--option-choice-no";
      case YesNoMaybe.Maybe:
        return "pollpage--option-choice-maybe";
    }
  };

  const mapChoiceToIcon = (c: YesNoMaybe) => {
    switch (c) {
      case YesNoMaybe.Yes:
        return <CheckCircleOutlined />;
      case YesNoMaybe.No:
        return <CloseCircleOutlined />;
      case YesNoMaybe.Maybe:
        return <QuestionCircleOutlined />;
    }
  };

  return (
    <div className="pollpage--participation-choice-row">
      {options?.map((o, idx) => {
        const p = participation.choices.find((c) => c.option == o._id);
        if (p)
          return (
            <div key={idx} className={mapChoiceToClassName(p.choice)}>
              {mapChoiceToIcon(p.choice)}
            </div>
          );
        else return <div key={idx} />;
      })}
    </div>
  );
};

const PollPage: NextPage = () => {
  const router = useRouter();
  const { pollLink } = router.query;

  const { error, loading, data } = useQuery<GetPollByLink>(GET_POLL_BY_LINK, {
    skip: !pollLink,
    variables: { pollLink },
  });

  if (loading) return <div>loading...</div>;
  if (error) return <div>An Error occured: {JSON.stringify(error)}</div>;

  const { getPollByLink: poll } = data || {};

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => router.back()}
        title={poll?.title}
        subTitle={poll?.author}
        style={{ marginBottom: "16px" }}
      >
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="Created">tbd</Descriptions.Item>
        </Descriptions>
      </PageHeader>
      <Card>
        <div className="pollpage--container">
          <div className="pollpage--participants">
            {poll?.participations.map((p, idx) => (
              <ParticipantRow key={idx} name={p.author} />
            ))}
          </div>
          <div className="pollpage--participations-container">
            <OptionsRow key="optionstitles" options={poll?.options || []} />
            <div className="pollpage--participations">
              {poll?.participations.map((p, idx) => (
                <ParticipationRow
                  key={idx}
                  participation={p}
                  options={poll.options}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default PollPage;
