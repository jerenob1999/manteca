import mongoose from "mongoose";
import { env } from "./environments";

export async function connectToMongoDB() {
  const uri = env.DB_URI;
  if (!uri) throw new Error("MongoDB URI is required!");

  try {
    if (mongoose.connection.readyState === 0) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(uri);
      console.log("Successfully connected to MongoDB!");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
