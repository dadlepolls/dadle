import mongoose, { Schema } from "mongoose";
import { ICalendarProvider } from "../integrations/calendar/calendar";
import { MicrosoftCalendarProvider } from "../integrations/calendar/MicrosoftCalendarProvider";
import { IUser } from "../util/types";
import { schema as CalendarSchema } from "./Calendar";

interface IUserDocument extends IUser, Document {
  getCalendarProviders: (onlyIncludeEnabled?: boolean) => ICalendarProvider[];
}

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
  onlyIncludeEnabled: boolean = true
) {
  return this.calendars
    ?.filter((c) => c.enabled || !onlyIncludeEnabled)
    .map<ICalendarProvider>((c) => {
      if (c.provider == "microsoft") return new MicrosoftCalendarProvider(c);
      else throw new Error(`Unknown provider for calendar with id ${c._id}`);
    });
};

let model: mongoose.Model<IUserDocument>;
if (mongoose.models.User) {
  model = mongoose.models.User;
} else {
  model = mongoose.model<IUserDocument>("User", schema);
}

export { model, schema };
