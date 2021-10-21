import mongoose, { ConnectOptions } from "mongoose";

const MONGODB_CONNECTION = process.env.MONGODB_CONNECTION || "";

if (!MONGODB_CONNECTION) {
  throw new Error(
    "Please define the MONGODB_CONNECTION environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: { conn?: typeof mongoose; promise?: Promise<typeof mongoose> };

async function dbConnect() {
  if (!cached) {
    cached = { conn: undefined, promise: undefined };
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {};

    cached.promise = mongoose
      .connect(MONGODB_CONNECTION, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
