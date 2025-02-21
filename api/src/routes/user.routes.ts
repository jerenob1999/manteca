import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { urlencoded } from "body-parser";
import cors from "cors";

export class UserRoutes {
  public router: Router = Router();
  public controller: UserController = new UserController();

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

    this.router.get("/:userId", this.controller.getUser);
    this.router.delete("/:userId/rule", this.controller.deleteRule);
    this.router.put("/:userId/rule", this.controller.addNewRule);
    this.router.post("/crypto", this.controller.depositWebhook);
  }
}
