import mongoose from "mongoose";

declare global {
  // This must be a `var` so it persists across module reloads in Next.js
  var mongoose: any;
}

type MongooseType = typeof mongoose;

let cached: { conn?: MongooseType | null; promise?: Promise<MongooseType> | null } =
  global.mongoose || { conn: null, promise: null };

async function dbConnect(): Promise<MongooseType> {
  // mongoose.set('debug', true);
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // prevent mongoose from buffering operations while disconnected
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("created connections to mongoDB.", m.connections.length);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    if (cached.conn?.connection.db) {
      await cached.conn.connection.db.admin().command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    }
  } catch (e: any) {
    cached.promise = null;
    console.error('Mongo connect error:', e?.message);
    if (e?.errorResponse) console.error('Mongo errorResponse:', e.errorResponse);
    throw e;
  }

  global.mongoose = cached;
  return cached.conn!;
}

export default dbConnect;