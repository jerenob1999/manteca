import { Router } from "express";
import {
  getUser,
  registerWebhook,
  deposit,
  addNewRule,
  deleteRule,
} from "../controllers/user.controller";

const router = Router();

router.get("/user/:userId", getUser);

router.post("/webhook", registerWebhook);

router.delete("/user/:userId/", deleteRule);

router.post("/user/:userId/", addNewRule);

router.post("/deposit/", deposit);

export default router;
