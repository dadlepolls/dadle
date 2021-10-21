import { PollComment } from "@util/types";
import mongoose, { Schema } from "mongoose";

const schema = new Schema<PollComment>({
  by: { type: Schema.Types.String, required: true },
  text: { type: Schema.Types.String, required: true },
});

let model: mongoose.Model<PollComment, {}, {}, {}>;
if (mongoose.models.PollComment) {
  model = mongoose.models.PollComment;
} else {
  model = mongoose.model<PollComment>("PollComment", schema);
}

export { model, schema };

