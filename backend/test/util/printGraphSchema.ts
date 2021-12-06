import "reflect-metadata";
import { printSchema } from "graphql";
import { stdout } from "process";
import { buildAppSchema } from "../../src/graphql/BuildSchema";

const main = async () => {
  stdout.write(printSchema(await buildAppSchema()));
};
main();
