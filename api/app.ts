import ErrorHandlerMiddleware from "./src/middlewares/errorHandler.middleware";
import MantecaService from "./src/services/manteca.service";
import { HealthRoutes } from "./src/routes/health.routes";
import { UserRoutes } from "./src/routes/user.routes";
import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setConfig();
    this.setStorageConfig();
    this.initManteca();
    this.routes();
    this.initializeErrorHandling();
  }

  private setConfig() {
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(cors());
  }

  private initManteca() {
    MantecaService.getInstance(process.env.API_KEY);
  }

  private initializeErrorHandling() {
    this.app.use(ErrorHandlerMiddleware);
  }

  private async setStorageConfig() {
    if (process.env.DB_URL) {
      try {
        mongoose.Promise = global.Promise;
        await mongoose.connect(process.env.DB_URL);
        console.log("Successfully connected to MongoDB!");
      } catch (err) {
        console.log(err);
      }
    }
  }

  private routes(): void {
    this.app.use("/v1/", new HealthRoutes().router);
    this.app.use("/v1/user", new UserRoutes().router);
  }
}

export default new App().app;
