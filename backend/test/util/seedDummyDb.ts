import dotenv from "dotenv";
import { PollOptionType, YesNoMaybe } from "../../src/util/types";
dotenv.config();
import dbConnect from "../../src/db/db";
import { Poll } from "../../src/db/models";
import { Types } from "mongoose";

const main = async () => {
  await dbConnect();

  await Poll.findByIdAndUpdate(
    "618391e2fb228fb3bc94e3e9",
    {
      author: { anonName: "Poll1-Author" },
      title: "Poll1",
      link: "linkToPoll1",
      comments: [
        { by: "commentor1", text: "comment text 1" },
        { by: "commentor2", text: "comment text 2" },
      ],
      options: [
        {
          _id: "618393b80741d1adcaeb9306",
          type: PollOptionType.Arbitrary,
          title: "option1",
        },
        {
          _id: "618393d8406ca55e92f10d44",
          type: PollOptionType.Arbitrary,
          title: "option2",
        },
        {
          _id: "618393f57a35d38c4f0af3a6",
          type: PollOptionType.Arbitrary,
          title: "option3",
        },
      ],
      participations: [
        {
          _id: "6183940cbc075756bf99191d",
          author: "participant 1",
          choices: [
            {
              option: new Types.ObjectId("618393b80741d1adcaeb9306"),
              choice: YesNoMaybe.Yes,
            },
            {
              option: new Types.ObjectId("618393d8406ca55e92f10d44"),
              choice: YesNoMaybe.No,
            },
            {
              option: new Types.ObjectId("618393f57a35d38c4f0af3a6"),
              choice: YesNoMaybe.Maybe,
            },
          ],
        },
        {
          _id: "6183946bf94d7ca802f3a524",
          author: "participant 2",
          choices: [
            {
              option: new Types.ObjectId("618393b80741d1adcaeb9306"),
              choice: YesNoMaybe.Yes,
            },
            {
              option: new Types.ObjectId("618393f57a35d38c4f0af3a6"),
              choice: YesNoMaybe.No,
            },
          ],
        },
      ],
    },
    { upsert: true }
  );

  await Poll.findByIdAndUpdate(
    "6183999a641b2ba12d528ff6",
    {
      author: { anonName: "Poll2-Author" },
      title: "Poll2",
      link: "linkToPoll2",
      comments: [
        { by: "commentor3", text: "comment text 3" },
        { by: "commentor4", text: "comment text 4" },
      ],
      options: [
        {
          _id: "618399b0efffa57f99138fe1",
          type: PollOptionType.Date,
          from: new Date("2021-11-08"),
        },
        {
          _id: "618399b78b890e7c323a21e3",
          type: PollOptionType.DateTime,
          from: new Date("2021-11-04 10:00"),
          to: new Date("2021-11-04 13:00"),
        },
        {
          _id: "618399bb6cf11dc075eb458f",
          type: PollOptionType.DateTime,
          from: new Date("2021-11-05 14:00"),
          to: new Date("2021-11-05 19:00"),
        },
      ],
      participations: [
        {
          _id: "61839aac138650d554bed41a",
          author: "participant 3",
          choices: [
            {
              option: new Types.ObjectId("618399b0efffa57f99138fe1"),
              choice: YesNoMaybe.Yes,
            },
            {
              option: new Types.ObjectId("618399b78b890e7c323a21e3"),
              choice: YesNoMaybe.No,
            },
            {
              option: new Types.ObjectId("618399bb6cf11dc075eb458f"),
              choice: YesNoMaybe.Maybe,
            },
          ],
        },
        {
          _id: "61839ab089e13ef722e8430a",
          author: "participant 2",
          choices: [
            {
              option: new Types.ObjectId("618399b78b890e7c323a21e3"),
              choice: YesNoMaybe.Yes,
            },
            {
              option: new Types.ObjectId("618399bb6cf11dc075eb458f"),
              choice: YesNoMaybe.No,
            },
          ],
        },
      ],
    },
    { upsert: true }
  );

  console.log("done");
};

main();
