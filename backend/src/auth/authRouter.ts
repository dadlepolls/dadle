import { User as TGraphUser } from "@microsoft/microsoft-graph-types";
import { User } from "../db/models";
import { issueToken } from "../auth/token";
import "isomorphic-fetch";
import OAuth2Strategy, { VerifyCallback } from "passport-oauth2";
import * as msgraph from "@microsoft/microsoft-graph-client";
import passport from "passport";
import express, { Request } from "express";

const authRouter = express.Router();

//tenant id is given, we assume that authentication shall be enabled
if (process.env.AUTH_MS_TENANT_ID) {
  if (!process.env.BACKEND_PUBLIC_URL || !process.env.FRONTEND_PUBLIC_URL)
    throw new Error(
      "BACKEND_PUBLIC_URL and FRONTEND_PUBLIC_URL must be specified when authentication is enabled"
    );
}

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: `https://login.microsoftonline.com/${
        process.env.AUTH_MS_TENANT_ID ?? "common"
      }/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${
        process.env.AUTH_MS_TENANT_ID ?? "common"
      }/oauth2/v2.0/token`,
      clientID: process.env.AUTH_MS_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_MS_CLIENT_SECRET ?? "",
      callbackURL: `${process.env.BACKEND_PUBLIC_URL}/auth/callback` ?? "",
      scope: ["openid", "profile", "offline_access", "User.Read"],
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: Record<string, unknown>,
      cb: VerifyCallback
    ) => {
      const graphClient = msgraph.Client.init({
        authProvider: (done) => done(null, accessToken),
      });
      const graphUserInfo: TGraphUser = await graphClient.api("/me").get();
      if (!graphUserInfo.id)
        return cb(new Error("Couldn't retrieve user infomation"));

      const dbUser = await User.findOneAndUpdate(
        { idAtProvider: graphUserInfo.id },
        {
          provider: "microsoft",
          nameAtProvider: graphUserInfo.displayName ?? "UNKNOWN",
          mail: graphUserInfo.mail ?? "UNKNOWN",
        },
        { upsert: true, new: true }
      );
      if (!dbUser) return cb(new Error("Couldn't store user in db"));

      //User.name is user configurable. Set it to the name of the provider by default if necessary
      if (!dbUser.name) {
        dbUser.name = dbUser.nameAtProvider;
        await dbUser.save();
      }
      cb(null, dbUser);
    }
  )
);

authRouter.get("/login", (req, res, next) => {
  passport.authenticate("oauth2", { state: "" })(req, res, next);
});

authRouter.get(
  "/callback",
  passport.authenticate("oauth2", {
    failureRedirect: `${process.env.FRONTEND_PUBLIC_URL}/login/callback?failure=true`,
    session: false,
  }),
  (req, res) => {
    if (!req.user || !req.user._id)
      return res.status(401).send("Could not find user!");
    const token = issueToken(String(req.user._id));
    return res.redirect(
      `${process.env.FRONTEND_PUBLIC_URL}/login/callback?token=${token}`
    );
  }
);

export { authRouter };
