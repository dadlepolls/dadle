import mongoose, { Schema } from "mongoose";
import { IUser } from "../util/types";

const schema = new Schema<IUser>(
  {
    provider: { type: Schema.Types.String, required: true },
    idAtProvider: {
      type: Schema.Types.String,
      required: true,
      index: true,
      unique: true,
    },
    nameAtProvider: { type: Schema.Types.String, required: true },
    name: { type: Schema.Types.String, required: true },
    mail: { type: Schema.Types.String, required: true },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

let model: mongoose.Model<IUser>;
if (mongoose.models.User) {
  model = mongoose.models.User;
} else {
  model = mongoose.model<IUser>("User", schema);
}

export { model, schema };
