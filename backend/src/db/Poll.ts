import { schema as PollCommentSchema } from "@db/PollComment";
import { schema as PollOptionSchema } from "@db/PollOption";
import { Poll } from "@util/types";
import mongoose, { Schema } from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const schema = new Schema<Poll>({
  title: { type: Schema.Types.String, required: true },
  link: { type: Schema.Types.String, required: true, unique: true },
  author: { type: Schema.Types.String },
  options: [PollOptionSchema],
  comments: [PollCommentSchema],
});
schema.plugin(mongooseUniqueValidator);

let model;
if (mongoose.models.Poll) {
  model = mongoose.models.Poll;
} else {
  model = mongoose.model<Poll>("Poll", schema);
}

export { model, schema };

