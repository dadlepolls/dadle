import { ICalendarProvider, IMicrosoftCalendar } from "./calendar";
import {
  Event as TGraphEvent,
  Calendar as TGraphCalendar,
  User as TGraphUser,
} from "@microsoft/microsoft-graph-types";
import axios from "axios";
import moment from "moment";
import "moment-timezone";
import * as msgraph from "@microsoft/microsoft-graph-client";
import { EventStatus, IEvent } from "../../util/types";
import express, { Request } from "express";
import passport from "passport";
import OAuth2Strategy, { VerifyCallback } from "passport-oauth2";
import { issueToken, verifyToken } from "../../auth/token";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../../db/models";

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

  public static async discoverCalendars(graphClient: msgraph.Client) {
    const graphCalendars: TGraphCalendar[] = (
      await graphClient.api("/me/calendars").get()
    ).value;
    return graphCalendars;
  }

  public static apiRouter() {
    const router = express.Router();

    //tenant id is given, we assume that ms calendar shall be enabled
    if (process.env.CAL_MS_TENANT_ID) {
      if (!process.env.BACKEND_PUBLIC_URL || !process.env.FRONTEND_PUBLIC_URL)
        throw new Error(
          "BACKEND_PUBLIC_URL and FRONTEND_PUBLIC_URL must be specified when authentication is enabled"
        );
    }

    passport.use(
      "cal_microsoft",
      new OAuth2Strategy(
        {
          authorizationURL: `https://login.microsoftonline.com/${
            process.env.CAL_MS_TENANT_ID ?? "common"
          }/oauth2/v2.0/authorize`,
          tokenURL: `https://login.microsoftonline.com/${
            process.env.CAL_MS_TENANT_ID ?? "common"
          }/oauth2/v2.0/token`,
          clientID: process.env.CAL_MS_CLIENT_ID ?? "",
          clientSecret: process.env.CAL_MS_CLIENT_SECRET ?? "",
          callbackURL:
            `${process.env.BACKEND_PUBLIC_URL}/cal/microsoft/callback` ?? "",
          scope: [
            "openid",
            "profile",
            "offline_access",
            "User.Read",
            "Calendars.Read",
          ],
          passReqToCallback: true,
        },
        async (
          req: Request,
          accessToken: string,
          refreshToken: string,
          profile: Record<string, unknown>,
          cb: VerifyCallback
        ) => {
          //parsed state is a signed token containing the user id this operation is made for
          let parsedState: JwtPayload;
          try {
            parsedState = verifyToken(String(req.query.state), {
              claims: ["cal_microsoft"],
            });
            if (!parsedState.sub) throw new Error();
          } catch (_) {
            return cb(new Error("invalid state token given"));
          }

          //user that these calendars will belong to
          const dbUser = await User.findById(parsedState.sub);
          if (!dbUser) return cb(new Error("User was deleted"));

          //graph client to get user info
          const graphClient = msgraph.Client.init({
            authProvider: (done) => done(null, accessToken),
          });

          //fetch user info
          const graphUserInfo: TGraphUser = await graphClient.api("/me").get();
          if (!graphUserInfo.id)
            return cb(new Error("Couldn't retrieve user infomation"));

          //fetch user's calendars from microsoft graph
          let cals: TGraphCalendar[];
          try {
            cals = await this.discoverCalendars(graphClient);
          } catch (err) {
            return cb(new Error("Couldn't retrieve user calendars"));
          }

          //calendars that already exist for this provider
          const existingCalendars = (dbUser.calendars || []).filter(
            (c) => c.provider == "microsoft"
          ) as IMicrosoftCalendar[];

          //array of calendars (ms calendar ids) that have been added to the collection
          const freshlyAddedCalendars: string[] = [];

          for (const cal of cals) {
            const existing = existingCalendars.find(
              (c) => c.calendarId == cal.id
            );
            if (existing) {
              //update names and refresh token if calendar already exists
              existing.friendlyName = cal.name || "";
              existing.usernameAtProvider =
                graphUserInfo.userPrincipalName || "";
              existing.refreshToken = refreshToken;
            } else {
              dbUser.calendars?.push({
                provider: "microsoft",
                enabled: true,
                friendlyName: cal.name || "",
                usernameAtProvider: graphUserInfo.userPrincipalName || "",
                refreshToken,
                calendarId: cal.id || "",
              });
              if (cal.id) freshlyAddedCalendars.push(cal.id);
            }
          }

          dbUser.markModified("calendars");
          await dbUser.save();

          return cb(null, dbUser, {
            freshlyAddedCalendars: (dbUser.calendars || [])
              .filter((c) =>
                freshlyAddedCalendars.some((f) => f == c.calendarId)
              )
              .map((c) => c._id ?? ""), //map the ms calendar ids to our db calendar ids
          });
        }
      )
    );

    router.get("/add", (req, res, next) => {
      if (!req.query.token)
        return res
          .status(400)
          .send('Provide token with "frontend" claim for adding a calendar');
      const token = verifyToken(String(req.query.token));
      if (!token.sub) return res.status(400).send("Token is missing subject");

      passport.authenticate("cal_microsoft", {
        state: issueToken(token.sub, {
          claims: ["cal_microsoft"],
          expiresIn: "10m",
        }),
      })(req, res, next);
    });

    router.get(
      "/callback",
      passport.authenticate("cal_microsoft", {
        failureRedirect: `${process.env.FRONTEND_PUBLIC_URL}/profile?calendarAddFailure=true`,
        session: false,
      }),
      (req, res) => {
        const authInfo = req.authInfo as { freshlyAddedCalendars?: string[] };
        return res.redirect(
          `${
            process.env.FRONTEND_PUBLIC_URL
          }/profile?freshlyAddedCalendars=${JSON.stringify(
            authInfo.freshlyAddedCalendars
          )}`
        );
      }
    );

    return router;
  }

  private async retrieveAccessToken(): Promise<string> {
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
