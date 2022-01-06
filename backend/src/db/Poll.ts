import mongoose, { Schema } from "mongoose";
import { IPoll } from "../util/types";
import { schema as UserOrAnonSchema } from "./UserOrAnon";
import { schema as PollCommentSchema } from "./PollComment";
import { schema as PollOptionSchema } from "./PollOption";
import { schema as PollParticipationSchema } from "./PollParticipation";

const schema = new Schema<IPoll>(
  {
    title: { type: Schema.Types.String, required: true },
    //caution: uniqueness of link has to be validate in controller, unique is only a mongo flag
    link: { type: Schema.Types.String, required: true, unique: true },
    timezone: {
      type: Schema.Types.String,
      required: true,
      default: "Europe/Berlin",
    },
    author: { type: UserOrAnonSchema, required: true },
    options: [PollOptionSchema],
    comments: [PollCommentSchema],
    participations: [PollParticipationSchema],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

let model: mongoose.Model<IPoll>;
if (mongoose.models.Poll) {
  model = mongoose.models.Poll;
} else {
  model = mongoose.model<IPoll>("Poll", schema);
}

export { model, schema };
