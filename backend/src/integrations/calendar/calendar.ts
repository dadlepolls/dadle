import { IEvent } from "src/util/types";

type ICalendar = IMicrosoftCalendar;

interface IGenericCalendar {
  _id?: string;
  refreshToken: string;
  enabled: boolean;
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

export type {
  ICalendar,
  IGenericCalendar,
  IMicrosoftCalendar,
  ICalendarProvider,
};
