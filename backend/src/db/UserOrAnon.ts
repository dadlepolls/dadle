import mongoose, { Schema } from "mongoose";
import { IUserOrAnon } from "../util/types";

const schema = new Schema<IUserOrAnon>({
  anonName: { type: Schema.Types.String },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

let model: mongoose.Model<IUserOrAnon>;
if (mongoose.models.UserOrAnon) {
  model = mongoose.models.UserOrAnon;
} else {
  model = mongoose.model<IUserOrAnon>("UserOrAnon", schema);
}

export { model, schema };
