import { IEvent } from "src/util/types";
import { MicrosoftCalendarProvider } from "./MicrosoftCalendarProvider";

type ICalendar = IMicrosoftCalendar;

interface IGenericCalendar {
  _id?: string;
  refreshToken: string;
  enabled: boolean;
  healthy?: boolean;
  friendlyName: string;
  usernameAtProvider: string;
}

interface IMicrosoftCalendar extends IGenericCalendar {
  provider: "microsoft";
  calendarId: string;
}

interface ICalendarProvider {
  retrieveEvents: (rangeStart: Date, rangeEnd: Date) => Promise<IEvent[]>;
}

const getProviderForCalendar = (calendar: ICalendar): ICalendarProvider => {
  if (calendar.provider == "microsoft")
    return new MicrosoftCalendarProvider(calendar);
  else throw new Error(`Unknown provider for calendar with id ${calendar._id}`);
};

export { getProviderForCalendar };

export type {
  ICalendar,
  IGenericCalendar,
  IMicrosoftCalendar,
  ICalendarProvider,
};
