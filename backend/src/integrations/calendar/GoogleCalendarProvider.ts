import express from "express";
import passport from "passport";
import { ICalendarProvider, IGoogleCalendar } from "./calendar";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import {
  issueToken,
  parseTokenMiddleware,
  verifyToken,
} from "../../auth/token";
import { IEvent, EventStatus } from "../../util/types";
import { CalendarProviders } from "./CalendarProviders";
import { User } from "../../db/models";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import moment from "moment";

//client id is given, we assume that ms calendar shall be enabled
if (process.env.CAL_GOOGLE_CLIENT_ID) {
  if (!process.env.CAL_GOOGLE_CLIENT_SECRET)
    throw new Error(
      "CAL_GOOGLE_CLIENT_SECRET must be specified when Google Calendar is enabled"
    );
  if (!process.env.BACKEND_PUBLIC_URL || !process.env.FRONTEND_PUBLIC_URL)
    throw new Error(
      "BACKEND_PUBLIC_URL and FRONTEND_PUBLIC_URL must be specified when Google Calendar is enabled"
    );
}

class GoogleCalendarProvider implements ICalendarProvider {
  googleCalendarId: string;
  oauthClient: OAuth2Client;

  constructor(calendar: IGoogleCalendar) {
    this.googleCalendarId = calendar.calendarId;
    this.oauthClient = new google.auth.OAuth2({
      clientId: process.env.CAL_GOOGLE_CLIENT_ID,
      clientSecret: process.env.CAL_GOOGLE_CLIENT_SECRET,
    });
    this.oauthClient.setCredentials({ refresh_token: calendar.refreshToken });
  }

  async retrieveEvents(rangeStart: Date, rangeEnd: Date) {
    const cal = google.calendar({
      version: "v3",
      auth: this.oauthClient,
    });

    const gEvents = await cal.events.list({
      calendarId: this.googleCalendarId,
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
    });

    if (!gEvents.data.items)
      throw new Error(
        `Couldn't fetch events from Google Calendar ${this.googleCalendarId}`
      );

    const determineEventStatus = (s: string | undefined | null) => {
      if (s === "confirmed") return EventStatus.Confirmed;
      if (s === "tentative") return EventStatus.Tentative;
      else return EventStatus.Free;
    };

    return gEvents.data.items.map<IEvent>((e) => ({
      title: e.summary ?? "",
      from: moment
        .tz(e.start?.dateTime ?? "", e.start?.timeZone ?? "")
        .toDate(),
      to: moment.tz(e.end?.dateTime ?? "", e.end?.timeZone ?? "").toDate(),
      status: determineEventStatus(e.status),
    }));
  }

  public static async discoverCalendars(oauth: OAuth2Client) {
    const calClient = google.calendar({
      version: "v3",
      auth: oauth,
    });
    const response = await calClient.calendarList.list();
    if (!response.data.items)
      throw new Error("Couldn't discover available Google calendars");
    return response.data.items;
  }

  public static apiRouter() {
    const router = express.Router();

    passport.use(
      "google",
      new GoogleStrategy(
        {
          passReqToCallback: true,
          clientID: process.env.CAL_GOOGLE_CLIENT_ID ?? "unknown_client_id",
          clientSecret: process.env.CAL_GOOGLE_CLIENT_SECRET ?? "unknown_client_secret",
          callbackURL:
            `${process.env.BACKEND_PUBLIC_URL}/cal/google/callback` ?? "",
          scope: [
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
          ],
        },
        async (
          req: Request,
          accessToken: string,
          refreshToken: string,
          profile,
          cb: VerifyCallback
        ) => {
          //parsed state is a signed token containing the user id this operation is made for
          let parsedState: JwtPayload;
          try {
            parsedState = verifyToken(String(req.query.state), {
              claims: ["cal_google"],
            });
            if (!parsedState.sub) throw new Error();
          } catch (_) {
            return cb(new Error("invalid state token given"));
          }

          //user that these calendars will belong to
          const dbUser = await User.findById(parsedState.sub);
          if (!dbUser) return cb(new Error("User was deleted"));

          const oauth2 = new google.auth.OAuth2();
          oauth2.setCredentials({
            access_token: accessToken,
          });
          const cals = await this.discoverCalendars(oauth2);

          //calendars that already exist for this provider
          const existingCalendars = (dbUser.calendars || []).filter(
            (c) => c.provider == "google"
          ) as IGoogleCalendar[];

          //array of calendars (ms calendar ids) that have been added to the collection
          const freshlyAddedCalendars: string[] = [];

          for (const cal of cals) {
            const calName = cal.summaryOverride ?? cal.summary ?? "";
            const username = profile.emails?.length
              ? profile.emails[0].value
              : profile.displayName;

            const existing = existingCalendars.find(
              (c) => c.calendarId == cal.id
            );
            if (existing) {
              //update names and refresh token if calendar already exists
              existing.friendlyName = calName;
              existing.usernameAtProvider = username;
              existing.refreshToken = refreshToken;
            } else {
              dbUser.calendars?.push({
                provider: "google",
                enabled: true,
                friendlyName: calName,
                usernameAtProvider: username,
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
              .map((c) => c._id ?? ""), //map the google calendar ids to our db calendar ids
          });
        }
      )
    );

    router.get("/add", parseTokenMiddleware, (req, res, next) => {
      if (!req.user?._id) return res.status(401).send("User id missing");

      passport.authenticate("google", {
        state: issueToken(req.user._id, {
          claims: ["cal_google"],
          expiresIn: "10m",
        }),
        accessType: "offline",
        prompt: "consent",
      })(req, res, next);
    });

    router.get(
      "/callback",
      passport.authenticate("google", {
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
}

CalendarProviders.registerProviderRouter(
  "google",
  "Google",
  GoogleCalendarProvider.apiRouter()
);

export { GoogleCalendarProvider };
