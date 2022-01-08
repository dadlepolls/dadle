import mongoose, { Schema } from "mongoose";
import {
  getProviderForCalendar,
  ICalendarProvider,
} from "../integrations/calendar/calendar";
import { IUser } from "../util/types";
import { schema as CalendarSchema } from "./Calendar";

interface IUserDocument extends IUser, Document {
  getCalendarProviders: (onlyIncludeEnabled?: boolean) => ICalendarProvider[];
}

const schema = new Schema<IUserDocument>(
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
    calendars: [CalendarSchema],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

schema.methods.getCalendarProviders = function (
  this: IUser,
  onlyIncludeEnabled = true
) {
  return this.calendars
    ?.filter((c) => c.enabled || !onlyIncludeEnabled)
    .map<ICalendarProvider>(getProviderForCalendar);
};

let model: mongoose.Model<IUserDocument>;
if (mongoose.models.User) {
  model = mongoose.models.User;
} else {
  model = mongoose.model<IUserDocument>("User", schema);
}

export { model, schema };
