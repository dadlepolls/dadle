import { ICalendarProvider, IMicrosoftCalendar } from "./calendar";
import { Event as TGraphEvent } from "@microsoft/microsoft-graph-types";
import axios from "axios";
import moment from "moment";
import "moment-timezone";
import * as msgraph from "@microsoft/microsoft-graph-client";
import { EventStatus, IEvent } from "../../util/types";

class MicrosoftCalendarProvider implements ICalendarProvider {
  private calendarInfo;
  private tenantId;
  private clientId;
  private clientSecret;
  private graphClient;
  private accessToken?: string;

  constructor(cal: IMicrosoftCalendar) {
    this.calendarInfo = cal;

    this.tenantId = process.env.CAL_MS_TENANT_ID ?? "";
    this.clientId = process.env.CAL_MS_CLIENT_ID ?? "";
    this.clientSecret = process.env.CAL_MS_CLIENT_SECRET ?? "";
    if (!this.tenantId || !this.clientId || !this.clientSecret)
      throw new Error(
        "Please specify CAL_MS_TENANT_ID, CAL_MS_CLIENT_ID and CAL_MS_CLIENT_SECRET for linking MS calendars"
      );

    this.graphClient = msgraph.Client.init({
      authProvider: async (done) => {
        if (this.accessToken) return done(null, this.accessToken);
        try {
          const token = await this.retrieveAccessToken();
          this.accessToken = token;
          done(null, token);
        } catch (err) {
          done(err, null);
        }
      },
    });
  }

  /*private */ public async retrieveAccessToken(): Promise<string> {
    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: "Calendars.Read",
      refresh_token: this.calendarInfo.refreshToken,
      grant_type: "refresh_token",
    };
    const response = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      Object.keys(params)
        .map(
          (key) =>
            `${key}=${encodeURIComponent(params[key as keyof typeof params])}`
        )
        .join("&"),
      { headers: { "content-type": "application/x-www-form-urlencoded" } }
    );

    if (!response.data || !response.data.access_token) {
      console.error(response);
      throw new Error("No access_token in response");
    }

    return response.data.access_token;
  }

  async retrieveEvents(rangeStart: Date, rangeEnd: Date) {
    const response: msgraph.PageCollection = await this.graphClient
      .api(
        `/me/calendars/${
          this.calendarInfo.calendarId
        }/calendarView?startDateTime=${rangeStart.toISOString()}&endDateTime=${rangeEnd.toISOString()}`
      )
      .top(500)
      .get();

    const events: IEvent[] = [];
    const iteratorCallback: msgraph.PageIteratorCallback = (
      event: TGraphEvent
    ) => {
      let status = EventStatus.Confirmed;
      if (event.showAs == "free") status = EventStatus.Free;
      if (event.showAs == "tentative") status = EventStatus.Tentative;

      if (!event.start?.dateTime || !event.start?.timeZone)
        throw new Error("Event start date expected");
      if (!event.end?.dateTime || !event.end?.timeZone)
        throw new Error("Event end date expected");

      events.push({
        title: event.subject ?? "",
        from: moment.tz(event.start.dateTime, event.start.timeZone).toDate(),
        to: moment.tz(event.end.dateTime, event.end.timeZone).toDate(),
        status,
      });
      return true;
    };
    const pageIterator = new msgraph.PageIterator(
      this.graphClient,
      response,
      iteratorCallback
    );
    await pageIterator.iterate();

    return events;
  }
}

export { MicrosoftCalendarProvider };
