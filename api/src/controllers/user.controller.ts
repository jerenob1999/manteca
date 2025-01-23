import { NextFunction, Request, Response } from "express";
import { RuleType } from "../interfaces/rule.interface";
import {
  addOrUpdateRule,
  deleteRuleByUserId,
  getRuleByUserId,
} from "../services/user.services";
import { env } from "../configs/environments";

var myHeaders = new Headers();
myHeaders.append("md-api-key", env.API_KEY || "");

var requestOptions = {
  method: "GET",
  headers: myHeaders,
};

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
    const response = await fetch(
      `https://sandbox.manteca.dev/crypto/v1/user/${userId}`,
      requestOptions
    );
    const user = await response.json();

    if (user?.internalStatus === "USER_NF") {
      throw new Error("User not found.");
    }
    const rule = await addOrUpdateRule(ruleType, userId);
    res.status(200).json({ message: "Rule added/updated successfully.", rule });
  } catch (error) {
    console.error("Error in addNewRule controller:", error);
    next(error);
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const response = await fetch(
      `https://sandbox.manteca.dev/crypto/v1/user/${userId}`,
      requestOptions
    );
    const user = await response.json();
    const rule = await getRuleByUserId(userId);
    res.send({ user, rule });
  } catch (error) {
    console.error("Error in addNewRule controller:", error);
    res.status(500).json({ error: "Failed to process the request." });
  }
};

export const deposit = async (req: Request, res: Response) => {
  const receivedSecret = req.headers["x-webhook-secret"];
  const event = req.body;

  console.log(req.body);
  res.status(200).send("Evento procesado correctamente");
};

export const registerWebhook = async () => {
  const raw = JSON.stringify({
    url: "https://671b-2803-9800-98cb-8292-6dd8-5d68-5d1e-82f9.ngrok-free.app/api/deposit",
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
