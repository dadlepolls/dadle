import mongoose, { Schema } from "mongoose";
import { IPollChoice } from "../util/types";

const schema = new Schema<IPollChoice>({
  option: { type: Schema.Types.ObjectId, required: true },
  choice: { type: Schema.Types.Number, required: true },
});

let model: mongoose.Model<IPollChoice>;
if (mongoose.models.PollChoice) {
  model = mongoose.models.PollChoice;
} else {
  model = mongoose.model<IPollChoice>("PollChoice", schema);
}

export { model, schema };
