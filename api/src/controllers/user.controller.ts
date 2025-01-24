import { NextFunction, Request, Response } from "express";
import { RuleType } from "../interfaces/rule.interface";
import {
  addOrUpdateRule,
  deleteRuleByUserId,
  getRuleByUserId,
} from "../services/user.services";
import { env } from "../configs/environments";
import { axiosInstanceManteca } from "../lib/axios";

var myHeaders = new Headers();
myHeaders.append("md-api-key", env.API_KEY || "");

export const deleteRule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const message = await deleteRuleByUserId(userId);
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error in deleteRule controller:", error);
    next(error);
  }
};

export const addNewRule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ruleType = req.body?.ruleType;
  const { userId } = req.params;

  if (
    !ruleType ||
    ![RuleType.INSTA_INVERSION, RuleType.INSTA_VENTA].includes(ruleType)
  ) {
    res.status(400).json({ error: "Invalid or missing 'ruleType' field." });
  }

  if (!userId) {
    res.status(400).json({ error: "Missing 'userId' field." });
  }

  try {
    const response = await axiosInstanceManteca.get(`/user/${userId}`);
    const user = await response.data;

    if (!user) {
      throw new Error("User not found.");
    }

    const rule = await addOrUpdateRule(ruleType, userId);
    res.status(200).json({ message: "Rule added/updated successfully.", rule });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const response = await axiosInstanceManteca.get(`/user/${userId}`);
    const user = await response.data;
    const balanceResponse = await axiosInstanceManteca.get(
      `/user/${userId}/balance`
    );
    const balance = await balanceResponse.data;
    const rule = await getRuleByUserId(userId);
    res.send({ user, rule, balance });
  } catch (error) {
    next(error);
  }
};

export const deposit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const receivedSecret = req.headers["x-webhook-secret"];
  const event = req.body;

  if (!receivedSecret || receivedSecret !== env.WEBHOOK_SECRET) {
    res.status(401).send("Unauthorized");
  }

  try {
    const rule = await getRuleByUserId(userId);
    if (rule?.rule === RuleType.INSTA_INVERSION) {
    }

    if (rule?.rule === RuleType.INSTA_VENTA) {
      const data = {
        userAnyId: userId,
        asset: "USDT",
        against: "ARS",
        againstAmount: "1",
      };
      const response = await axiosInstanceManteca.post(
        "/synthetics/ramp-off",
        data
      );
      const result = await response.data;
      console.log(result);
    }
    res.status(200).send("Evento procesado correctamente");
  } catch (error: any) {
    console.error(error?.response?.data);
    next(error);
  }
};

export const registerWebhook = async () => {
  const raw = JSON.stringify({
    url: "http://localhost:3000/api/deposit",
    events: ["FIAT_WITHDRAW_UPDATE"],
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  fetch("https://sandbox.manteca.dev/crypto/v1/webhook", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};
