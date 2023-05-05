import { IEvent } from "src/util/types";
import { MicrosoftCalendarProvider } from "./MicrosoftCalendarProvider";
import { GoogleCalendarProvider } from "./GoogleCalendarProvider";

type ICalendar = IMicrosoftCalendar | IGoogleCalendar;

interface IGenericCalendar {
  _id?: string;
  refreshToken: string;
  enabled: boolean;
  healthy?: boolean;
  friendlyName: string;
  usernameAtProvider: string;
  canWrite?: boolean;
}

interface IMicrosoftCalendar extends IGenericCalendar {
  provider: "microsoft";
  calendarId: string;
}

interface IGoogleCalendar extends IGenericCalendar {
  provider: "google";
  calendarId: string;
}

interface ICalendarProvider {
  retrieveEvents: (rangeStart: Date, rangeEnd: Date) => Promise<IEvent[]>;
}

const getProviderForCalendar = (calendar: ICalendar): ICalendarProvider => {
  if (calendar.provider == "microsoft")
    return new MicrosoftCalendarProvider(calendar);
  else if (calendar.provider == "google")
    return new GoogleCalendarProvider(calendar);
  else throw new Error("Unknown provider for calendar");
};

export { getProviderForCalendar };

export type {
  ICalendar,
  IGenericCalendar,
  IMicrosoftCalendar,
  IGoogleCalendar,
  ICalendarProvider,
};
