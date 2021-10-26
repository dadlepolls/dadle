import mongoose, { Schema } from "mongoose";
import { IPollOptionResponse } from "../util/types";

const schema = new Schema<IPollOptionResponse>({
  by: { type: Schema.Types.String, required: true },
  response: { type: Schema.Types.Number, required: true },
});

let model: mongoose.Model<IPollOptionResponse>;
if (mongoose.models.PollOptionResponse) {
  model = mongoose.models.PollOptionResponse;
} else {
  model = mongoose.model<IPollOptionResponse>("PollOptionResponse", schema);
}

export { model, schema };

