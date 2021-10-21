import { schema as PollOptionResponseSchema } from "@db/PollOptionResponse";
import { PollOption } from "@util/types";
import mongoose, { Schema } from "mongoose";

const schema = new Schema<PollOption>({
  type: { type: Schema.Types.Number, required: true },
  from: { type: Schema.Types.Date },
  to: { type: Schema.Types.Date },
  title: { type: Schema.Types.String },
  responses: [PollOptionResponseSchema],
});

let model: mongoose.Model<PollOption, {}, {}, {}>;
if (mongoose.models.PollOption) {
  model = mongoose.models.PollOption;
} else {
  model = mongoose.model<PollOption>("PollOption", schema);
}

export { model, schema };

