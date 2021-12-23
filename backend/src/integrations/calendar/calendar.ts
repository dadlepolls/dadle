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

export type { ICalendar, IGenericCalendar, IMicrosoftCalendar };
