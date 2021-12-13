import mongoose, { Schema } from "mongoose";
import { IPollParticipation } from "../util/types";
import { schema as PollChoiceSchema } from "./PollChoice";
import { schema as UserOrAnonSchema } from "./UserOrAnon";

const schema = new Schema<IPollParticipation>({
  author: { type: UserOrAnonSchema, required: true },
  choices: [PollChoiceSchema],
});

let model: mongoose.Model<IPollParticipation>;
if (mongoose.models.PollParticipation) {
  model = mongoose.models.PollParticipation;
} else {
  model = mongoose.model<IPollParticipation>("PollParticipation", schema);
}

export { model, schema };
