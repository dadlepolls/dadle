import "reflect-metadata";
import { printSchema } from "graphql";
import { stdout } from "process";
import { buildAppSchema } from "../../src/graphql/BuildSchema";
import { IUser } from "../../src/util/types";

/* eslint-disable */
declare global {
  namespace Express {
    interface User extends Partial<IUser> {}
  }
}
/* eslint-enable */

const main = async () => {
  stdout.write(printSchema(await buildAppSchema()));
};
main();
