import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";

app.listen(process.env.PORT, () =>
  console.log(`${process.env.NAME} up and running`)
);
