import mongoose, { Mongoose } from "mongoose";
declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached: { conn?: mongoose.Mongoose, promise?: Promise<mongoose.Mongoose> } = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: undefined, promise: undefined };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI!;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {


    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("created connections to mongoDB.", mongoose.connections.length);
      return mongoose;
    });

  }
  try {
    cached.conn = await cached.promise;
    if (cached.conn?.connection.db) {
      await cached.conn.connection.db.admin().command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
  } catch (e) {
    cached.promise = undefined;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;