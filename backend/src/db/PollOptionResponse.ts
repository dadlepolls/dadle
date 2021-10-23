import { PollOptionResponse } from "@util/types";
import mongoose, { Schema } from "mongoose";

const schema = new Schema<PollOptionResponse>({
  by: { type: Schema.Types.String, required: true },
  response: { type: Schema.Types.Number, required: true },
});

let model;
if (mongoose.models.PollOptionResponse) {
  model = mongoose.models.PollOptionResponse;
} else {
  model = mongoose.model<PollOptionResponse>("PollOptionResponse", schema);
}

export { model, schema };

