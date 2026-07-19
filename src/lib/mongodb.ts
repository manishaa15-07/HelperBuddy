import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGO_URI in .env file");
}

// Use global caching to prevent multiple connections
let cached = (global as any).mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {}); // Removed deprecated options
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  console.log('Connected to MongoDB');
  return cached.conn;
}

export default connectDB;
