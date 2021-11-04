import mongoose, { Schema } from "mongoose";
import { IPollParticipation } from "../util/types";
import { schema as PollChoiceSchema } from "./PollChoice";

const schema = new Schema<IPollParticipation>({
  author: { type: Schema.Types.String, required: true },
  choices: [PollChoiceSchema],
});

let model: mongoose.Model<IPollParticipation>;
if (mongoose.models.PollParticipation) {
  model = mongoose.models.PollParticipation;
} else {
  model = mongoose.model<IPollParticipation>("PollParticipation", schema);
}

export { model, schema };
