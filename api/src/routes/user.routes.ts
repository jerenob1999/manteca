import { Router } from "express";
import {
  getUser,
  newDeposit,
  addNewRule,
  deleteRule,
} from "../controllers/user.controller";

const router = Router();

router.get("/user/:userId", getUser);

router.delete("/user/:userId/rule", deleteRule);

router.put("/user/:userId/rule", addNewRule);

router.post("/user/crypto", newDeposit);

export default router;
