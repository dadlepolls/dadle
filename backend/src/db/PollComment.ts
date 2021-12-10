import mongoose, { Schema } from "mongoose";
import { IPollComment } from "../util/types";
import { schema as UserOrAnonSchema } from "./UserOrAnon";

const schema = new Schema<IPollComment>({
  author: { type: UserOrAnonSchema, required: true },
  text: { type: Schema.Types.String, required: true },
});

let model: mongoose.Model<IPollComment>;
if (mongoose.models.PollComment) {
  model = mongoose.models.PollComment;
} else {
  model = mongoose.model<IPollComment>("PollComment", schema);
}

export { model, schema };

