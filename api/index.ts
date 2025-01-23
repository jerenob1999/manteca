import express from "express";
import router from "./src/routes/user.routes";
import { connectToMongoDB } from "./src/configs/db";
import { env } from "./src/configs/environments";
import { errorHandlerMiddleware } from "./src/middlewares/error.middleware";

const app = express();
connectToMongoDB();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
app.use(errorHandlerMiddleware);

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${env.PORT}`);
});
