import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "reflect-metadata";
import dbConnect from "./db/db";
import { buildAppSchema } from "./graphql/BuildSchema";
import mongoose from "mongoose";
import passport from "passport";
import { IGraphContext, IUser } from "./util/types";
import { getAuthRouter } from "./auth/authRouter";
import { parseTokenMiddleware } from "./auth/token";
import { CalendarProviders } from "./integrations/calendar/CalendarProviders";
import logger from "./log";
import { ApolloServer } from "@apollo/server";
import cors from "cors";
import { json } from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

/* eslint-disable */
declare global {
  namespace Express {
    interface User extends Partial<IUser> {}
  }
}
/* eslint-enable */

const app = express();
app.use(passport.initialize());
const port = process.env.HTTP_PORT || 3001;

app.use("/cal", CalendarProviders.getProviderRouter());

app.get("/", (req, res) => {
  res.status(403).send();
});

app.get("/health", (req, res) => {
  return res.json({
    state: "up",
    dbState: mongoose.STATES[mongoose.connection.readyState],
  });
});

app.use("/graphql", parseTokenMiddleware);

if (process.env.BACKEND_TRUST_PROXY) {
  const { BACKEND_TRUST_PROXY } = process.env;
  logger.info(`Trusting proxies: "${BACKEND_TRUST_PROXY}"`);
  app.set("trust proxy", BACKEND_TRUST_PROXY);
}

const main = async () => {
  //db setup
  await dbConnect();

  //auth routing setup
  app.use("/auth", await getAuthRouter());

  //graphql setup
  const schema = await buildAppSchema();
  const server = new ApolloServer<IGraphContext>({
    schema,
    plugins: [
      process.env.NODE_ENV == "development"
        ? ApolloServerPluginLandingPageLocalDefault()
        : ApolloServerPluginLandingPageProductionDefault(),
    ],
  });
  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req, user: req.user }),
    })
  );
  //startup app
  app.listen(port, () => {
    logger.info(`App listening on ${port}`);
  });
};

process.on("unhandledRejection", (reason, p) => {
  logger.debug(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
});

main();
