import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  DB_URI: process.env.DB_URI,
  PORT: process.env.PORT,
  API_KEY: process.env.API_KEY,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
};
