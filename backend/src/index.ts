import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "reflect-metadata";
import dbConnect from "./db/db";
import { buildAppSchema } from "./graphql/BuildSchema";
import mongoose from "mongoose";
import passport from "passport";
import { IGraphContext, IUser } from "./util/types";
import { authRouter } from "./auth/authRouter";
import { parseTokenMiddleware } from "./auth/token";
import { CalendarProviders } from "./integrations/calendar/CalendarProviders";

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

app.use("/auth", authRouter);

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

const main = async () => {
  await dbConnect();

  const schema = await buildAppSchema();

  const server = new ApolloServer({
    schema,
    context: ({ req }): IGraphContext => ({ req, user: req.user }),
    plugins: [
      process.env.NODE_ENV == "development"
        ? ApolloServerPluginLandingPageGraphQLPlayground()
        : ApolloServerPluginLandingPageProductionDefault(),
    ],
  });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(port, () => {
    console.log(`App listening on ${port}`);
  });
};

main();
