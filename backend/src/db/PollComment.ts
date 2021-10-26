import mongoose, { Schema } from "mongoose";
import { IPollComment } from "../util/types";

const schema = new Schema<IPollComment>({
  by: { type: Schema.Types.String, required: true },
  text: { type: Schema.Types.String, required: true },
});

let model: mongoose.Model<IPollComment>;
if (mongoose.models.PollComment) {
  model = mongoose.models.PollComment;
} else {
  model = mongoose.model<IPollComment>("PollComment", schema);
}

export { model, schema };

