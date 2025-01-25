import { NextFunction, Request, Response } from "express";
import { RuleType } from "../interfaces/rule.interface";
import {
  addOrUpdateRule,
  deleteRuleByUserId,
  getRuleByUserId,
} from "../services/user.services";
import { axiosInstanceManteca } from "../lib/axios";
import { AxiosResponse } from "axios";
import { LockPriceResponse } from "../interfaces/api.interfaces";
import { NewDepositEventBody } from "../interfaces/api.interfaces";
import { PriceCoinResponse } from "../interfaces/api.interfaces";
import { getCryptoPrice } from "../utils/getCryptoPrice.util";

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
    const response = await axiosInstanceManteca.get(`/user/all`);
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

export const newDeposit = async (
  req: Request<{}, {}, NewDepositEventBody>,
  res: Response,
  next: NextFunction
) => {
  const userId = req.body.data.userNumberId;
  const asset = req.body.data.asset;

  try {
    if (asset !== "USDT" && asset !== "USDC") {
      res.status(201).send(`Deposit successfull`);
      return;
    }

    const rule = await getRuleByUserId(userId);
    if (rule?.rule === RuleType.INSTA_INVERSION) {
      const btcToArsPrice: AxiosResponse<PriceCoinResponse> =
        await axiosInstanceManteca.get(`/price/${asset}_ARS`);

      const lockPrice: AxiosResponse<LockPriceResponse> =
        await axiosInstanceManteca.post("order/lock", {
          coin: `BTC_${asset}`,
          operation: "BUY",
          userId: userId,
        });

      console.log(
        getCryptoPrice(req.body.data.amount, btcToArsPrice.data.sell)
      );
      const newOrder = await axiosInstanceManteca.post("order", {
        userId: userId,
        amount: getCryptoPrice(req.body.data.amount, btcToArsPrice.data.sell),
        coin: `BTC_${asset}`,
        operation: "BUY",
        code: lockPrice.data.code,
      });

      res.status(201).send(newOrder.data);
    }

    if (rule?.rule === RuleType.INSTA_VENTA) {
      const response = await axiosInstanceManteca.post("/synthetics/ramp-off", {
        userAnyId: userId,
        asset: req.body.data.asset,
        against: "ARS",
        againstAmount: req.body.data.amount,
        withdrawAddress: "any-available",
      });

      res.status(200).send(response.data);
    }
  } catch (error: any) {
    console.error(error?.response?.data);
    next(error);
  }
};
