import { Router } from "express";
import { HealthController } from "../controllers/health.rcontroller";
import { urlencoded } from "body-parser";
import cors from "cors";

export class HealthRoutes {
  public router: Router = Router();
  public controller: HealthController = new HealthController();

  constructor() {
    this.init();
  }

  public init() {
    this.router.use(
      urlencoded({
        extended: true,
      })
    );

    this.router.use(cors());

    this.router.post("/", this.controller.getHealth);
    this.router.get("/", this.controller.getHealth);
  }
}
