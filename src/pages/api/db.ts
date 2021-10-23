// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import dbConnect from "@db/db";
import { Poll } from "@db/models";
import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const newPoll = new Poll({
    title: "abc",
    author: "peter",
    link: uuid(),
    comments: [
      {
        by: uuid(),
        text: "abc123",
      },
    ],
  });
  await newPoll.save();
  const polls = await Poll.find();
  res.status(200).json({ polls: polls });
}
