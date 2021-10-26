import mongoose, { Schema } from "mongoose";
import { IPollOption } from "../util/types";
import { schema as PollOptionResponseSchema } from "./PollOptionResponse";

const schema = new Schema<IPollOption>({
  type: { type: Schema.Types.Number, required: true },
  from: { type: Schema.Types.Date },
  to: { type: Schema.Types.Date },
  title: { type: Schema.Types.String },
  responses: [PollOptionResponseSchema],
});

let model: mongoose.Model<IPollOption>;
if (mongoose.models.PollOption) {
  model = mongoose.models.PollOption;
} else {
  model = mongoose.model<IPollOption>("PollOption", schema);
}

export { model, schema };

