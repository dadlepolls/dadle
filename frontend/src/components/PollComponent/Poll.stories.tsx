import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { Poll } from "./Poll";
import {
  PollOptionType,
  TPollWithOptionalAvailabilityHint,
  YesNoMaybe
} from "./PollTypes";

export default {
  title: "Poll",
  component: Poll,
  argTypes: {
    readOnly: {
      type: "boolean",
      description: "Disable adding and editing of participartion",
    },
    nameHint: {
      type: "string",
      description: "Name that will be shown for new participations",
    },
    allowNameEditForNewParticipation: {
      type: "boolean",
      description: "Allow the editing of the name for new participations",
    },
    poll: {
      description:
        "Poll object containing options, participations and metadata",
    },
    saveParticipationFunction: {
      action: "saveParticipationFunction",
    },
    deleteParticipationFunction: {
      action: "deleteParticipationFunction",
    },
    onNameHintChange: {
      action: "onNameHintChange",
    },
  },
} as ComponentMeta<typeof Poll>;

const defaultPoll: TPollWithOptionalAvailabilityHint = {
  options: [
    {
      type: PollOptionType.Arbitrary,
      title: "Option A",
      from: null,
      to: null,
      _id: "opta_id",
    },
    {
      type: PollOptionType.Arbitrary,
      title: "Option B",
      from: null,
      to: null,
      _id: "optb_id",
    },
    {
      type: PollOptionType.Arbitrary,
      title: "Option C",
      from: null,
      to: null,
      _id: "optc_id",
    },
  ],
  participations: [
    {
      _id: "part1",
      allowEdit: true,
      allowNameEdit: true,
      participantName: "Participant 1",
      choices: [
        { option: "opta_id", choice: YesNoMaybe.Yes },
        { option: "optb_id", choice: YesNoMaybe.Maybe },
      ],
    },
    {
      _id: "part2",
      allowEdit: false,
      allowNameEdit: false,
      participantName: "Participant 2",
      choices: [
        { option: "opta_id", choice: YesNoMaybe.Yes },
        { option: "optb_id", choice: YesNoMaybe.Maybe },
        { option: "optc_id", choice: YesNoMaybe.No },
      ],
    },
    {
      _id: "part3",
      allowEdit: true,
      allowNameEdit: false,
      participantName: "Participant 3",
      choices: [
        { option: "opta_id", choice: YesNoMaybe.Maybe },
        { option: "optb_id", choice: YesNoMaybe.Yes },
        { option: "optc_id", choice: YesNoMaybe.No },
      ],
    },
  ],
};

const Template: ComponentStory<typeof Poll> = (args) => {
  if (!args.poll) args.poll = defaultPoll;
  return <Poll {...args} />;
};

export const Primary = Template.bind({});

export const ReadOnly = Template.bind({});
ReadOnly.args = {
  readOnly: true,
};
ReadOnly.storyName = "Read only";

export const WithDateTime = Template.bind({});
WithDateTime.args = {
  poll: {
    ...defaultPoll,
    options: [
      {
        type: PollOptionType.DateTime,
        title: null,
        from: new Date(2022, 5, 17, 10, 0, 0, 0),
        to: new Date(2022, 5, 17, 10, 30, 0, 0),
        _id: "opta_id",
      },
      {
        type: PollOptionType.DateTime,
        title: null,
        from: new Date(2022, 5, 17, 15, 0, 0, 0),
        to: new Date(2022, 5, 17, 15, 30, 0, 0),
        _id: "optb_id",
      },
      {
        type: PollOptionType.DateTime,
        title: null,
        from: new Date(2022, 5, 18, 11, 0, 0, 0),
        to: new Date(2022, 5, 18, 11, 30, 0, 0),
        _id: "optc_id",
      },
    ],
  },
};
WithDateTime.storyName = "Date & Time";
