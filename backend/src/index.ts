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

const app = express();
const port = process.env.HTTP_PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

const main = async () => {
  await dbConnect();

  const schema = await buildAppSchema();

  const server = new ApolloServer({
    schema,
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
