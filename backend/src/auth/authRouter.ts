import { User } from "../db/models";
import { issueToken } from "../auth/token";
import express from "express";
import { generators, Issuer } from "openid-client";
import session from "express-session";
import crypto from "crypto";
import { readFileSync, writeFileSync } from "fs";
import logger from "../log";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

declare module "express-session" {
  interface SessionData {
    code_verifier: string;
  }
}

const SESSION_SECRET_PATH = "./secrets/session_secret";
const REDIRECT_URI = `${process.env.BACKEND_PUBLIC_URL}/auth/callback`;

const getSessionKey = async () => {
  try {
    const secret = String(readFileSync(SESSION_SECRET_PATH));
    return secret;
  } catch (_) {
    logger.info("Automatically generating new session secret...");
    const secretBuffer = await new Promise<Buffer>((resolve, reject) => {
      crypto.randomBytes(1024, (ex, buffer) => {
        if (ex) reject(ex);
        resolve(buffer);
      });
    });
    const secret = crypto
      .createHash("sha1")
      .update(secretBuffer)
      .digest("base64");
    writeFileSync(SESSION_SECRET_PATH, secret);
    return secret;
  }
};

const getAuthRouter = async () => {
  const authRouter = express.Router();
  if (!process.env.AUTH_ISSUER_BASEURL) return authRouter; //auth seems to be disabled by config, don't specify routes
  const issuer = await Issuer.discover(process.env.AUTH_ISSUER_BASEURL);

  //validate environment variables
  if (!process.env.AUTH_CLIENT_ID || !process.env.AUTH_CLIENT_SECRET)
    throw new Error(
      "AUTH_CLIENT_ID and AUTH_CLIENT_SECRET mzst be specified when authentication is enabled"
    );
  if (!process.env.BACKEND_PUBLIC_URL || !process.env.FRONTEND_PUBLIC_URL)
    throw new Error(
      "BACKEND_PUBLIC_URL and FRONTEND_PUBLIC_URL must be specified when authentication is enabled"
    );

  //enable sessions for auth routes
  authRouter.use(
    session({
      secret: await getSessionKey(),
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      cookie: { secure: "auto" },
    })
  );

  const client = new issuer.Client({
    client_id: process.env.AUTH_CLIENT_ID,
    client_secret: process.env.AUTH_CLIENT_SECRET,
    response_types: ["code"],
    redirect_uris: [REDIRECT_URI],
  });

  //redirect to authorization edpoint
  authRouter.get("/login", (req, res) => {
    const code_verifier = generators.codeVerifier();
    req.session.code_verifier = code_verifier;

    const code_challenge = generators.codeChallenge(code_verifier);
    return res.redirect(
      client.authorizationUrl({
        scope: "openid email profile",
        code_challenge,
        code_challenge_method: "S256",
      })
    );
  });

  //callback from authorization endpoint
  authRouter.get("/callback", async (req, res) => {
    try {
      const params = client.callbackParams(req);
      const tokenSet = await client.callback(REDIRECT_URI, params, {
        code_verifier: req.session.code_verifier,
      });
      const userinfo = await client.userinfo(tokenSet);

      let user = await User.findOne({
        idAtProvider: userinfo.sub,
      });

      if (user) {
        //update user details
        user.nameAtProvider = userinfo.name ?? "UNKNOWN";
        user.mail = userinfo.email ?? "UNKNOWN";
        await user.save();
      } else {
        //user doesn't exist yet in db
        user = await User.findOneAndUpdate(
          { idAtProvider: userinfo.sub },
          {
            name: userinfo.name ?? "UNKNOWN",
            nameAtProvider: userinfo.name ?? "UNKNOWN",
            mail: userinfo.email ?? "UNKNOWN",
            calendars: [],
          },
          { upsert: true, new: true }
        );
      }

      if (!user) return res.status(401).send("Could not store user!");
      const token = issueToken(String(user._id));

      return res.redirect(
        `${process.env.FRONTEND_PUBLIC_URL}/login/callback?token=${token}`
      );
    } catch (err) {
      return res.redirect(
        `${
          process.env.FRONTEND_PUBLIC_URL
        }/login/callback?failure=true&failureMsg=${(err as Error).message}`
      );
    }
  });

  return authRouter;
};

export { getAuthRouter };
