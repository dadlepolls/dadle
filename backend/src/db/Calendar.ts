import mongoose, { Schema } from "mongoose";
import { ICalendar } from "src/integrations/calendar/calendar";

const schema = new Schema<ICalendar>(
  {
    provider: { type: Schema.Types.String, required: true },
    refreshToken: { type: Schema.Types.String, required: true },
    enabled: { type: Schema.Types.Boolean, required: true },
    friendlyName: { type: Schema.Types.String, required: true },
    usernameAtProvider: { type: Schema.Types.String, required: true },
    canWrite: { type: Schema.Types.Boolean, default: false },

    //microsoft-specific fields
    calendarId: { type: Schema.Types.String },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

let model: mongoose.Model<ICalendar>;
if (mongoose.models.Calendar) {
  model = mongoose.models.Calendar;
} else {
  model = mongoose.model<ICalendar>("Calendar", schema);
}

export { model, schema };
