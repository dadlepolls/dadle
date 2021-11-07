import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv"; 
import fs from "fs";
dotenv.config();
import express from "express";
import { printSchema } from "graphql";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import dbConnect from "./db/db";
import { PollResolver } from "./graphql/Poll";

const app = express();
const port = process.env.HTTP_PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

const main = async () => {
  await dbConnect();

  const schema = await buildSchema({
    resolvers: [PollResolver],
  });
  if(process.env.SAVE_SCHEMA){
    fs.writeFileSync("schema.graphql", printSchema(schema));
  }

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(port, () => {
    console.log(`App listening on ${port}`);
  });
};

main();
