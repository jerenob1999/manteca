import GenericException from "../exceptions/generic.exception";
import { RuleType } from "../interfaces/rule.interface";
import { IRule } from "../interfaces/rule.interface";
import MantecaService from "./manteca.service";
import { Rule } from "../models/rules.model";
import { getCryptoPrice } from "../utils/getCryptoPrice.util";
import { NewDepositEventBody } from "../interfaces/manteca.interfaces";
import { isAxiosError } from "axios";

class UserService {
  private static instance: UserService;
  private mantecaService: MantecaService;

  static getInstance = () => {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  };

  constructor() {
    this.mantecaService = MantecaService.getInstance();
  }

  getUser = async (userId: string) => {
    try {
      const [user, userBalance, userRule] = await Promise.all([
        this.mantecaService.getUserById(userId),
        this.mantecaService.getUserBalanceById(userId),
        Rule.findOne({ userId }),
      ]);

      return { ...user, rule: userRule, balance: userBalance };
    } catch (error) {
      console.error("Error in getUser:", error);

      if (isAxiosError(error)) {
        throw new GenericException({
          status: error.response?.status || 500,
          internalStatus: error?.response?.data.internalStatus || "API_ERROR",
          message: error?.response?.data.message || "Unknown error",
        });
      }

      throw new GenericException({
        status: 500,
        internalStatus: "UNKNOWN_ERROR",
        message: "Unexpected error while retrieving the user",
      });
    }
  };

  setRule = async (ruleType: RuleType, userId: string): Promise<IRule> => {
    try {
      if (
        !ruleType ||
        ![RuleType.INSTA_INVERSION, RuleType.INSTA_VENTA].includes(ruleType)
      ) {
        throw new GenericException({
          status: 400,
          internalStatus: "RULE_NOT_FOUND",
          message: `Invalid ruleType field`,
        });
      }

      if (!userId) {
        throw new GenericException({
          status: 400,
          internalStatus: "USERID_NOT_FOUND",
          message: `missing userId field`,
        });
      }

      const existingRule = await Rule.findOne({ userId });

      if (existingRule) {
        existingRule.rule = ruleType;
        existingRule.updatedAt = new Date();
        return await existingRule.save();
      } else {
        const newRule = new Rule({ rule: ruleType, userId });
        return await newRule.save();
      }
    } catch (error) {
      console.error("Error in setRule:", error);

      if (error instanceof GenericException) {
        throw error;
      }

      throw new GenericException({
        status: 500,
        internalStatus: "SET_RULE_ERROR",
        message: "Unexpected error while adding a new rule",
      });
    }
  };

  deleteRuleByUserId = async (userId: string) => {
    try {
      const result = await Rule.deleteOne({ userId });
      if (result.deletedCount === 0) {
        throw new GenericException({
          status: 404,
          internalStatus: "RULE_NOT_FOUND",
          message: `No rule found for user ${userId}`,
        });
      }
      return `Rule for user ${userId} deleted successfully.`;
    } catch (error) {
      console.error("Error in deleteRuleByUserId:", error);

      if (error instanceof GenericException) {
        throw error;
      }

      throw new GenericException({
        status: 500,
        internalStatus: "DELETE_RULE_ERROR",
        message: "Unexpected error while deleting rule",
      });
    }
  };

  getRuleByUserId = async (userId: string): Promise<IRule | null> => {
    try {
      const rule = await Rule.findOne({ userId });
      if (!rule) {
        throw new GenericException({
          status: 404,
          internalStatus: "RULE_NOT_FOUND",
          message: `No rule found for user ${userId}`,
        });
      }
      return rule;
    } catch (error) {
      console.error("Error in getRuleByUserId:", error);
      if (error instanceof GenericException) {
        throw error;
      }

      throw new GenericException({
        status: 500,
        internalStatus: "GET_RULE_ERROR",
        message: "Unexpected error while retrieving the rule",
      });
    }
  };

  postDeposit = async (body: NewDepositEventBody) => {
    const userId = body.data.userNumberId;
    const asset = body.data.asset;

    try {
      if (asset !== "USDT" && asset !== "USDC") {
        return `Deposit successfull`;
      }

      const rule = await this.getRuleByUserId(userId);

      if (rule?.rule === RuleType.INSTA_INVERSION) {
        const btcToArsPrice = await this.mantecaService.getCoinPrice(
          `${asset}_ARS`
        );

        const lockPrice = await this.mantecaService.lockPrice({
          coin: `BTC_${asset}`,
          operation: "BUY",
          userId: userId,
        });

        await this.mantecaService.postOrder({
          userId: userId,
          amount: getCryptoPrice(body.data.amount, btcToArsPrice.sell),
          coin: `BTC_${asset}`,
          operation: "BUY",
          code: lockPrice.code,
        });

        return "New order successfull";
      }

      if (rule?.rule === RuleType.INSTA_VENTA) {
        const btcToArsPrice = await this.mantecaService.getCoinPrice(
          `${asset}_ARS`
        );

        const lockPrice = await this.mantecaService.lockPrice({
          coin: `BTC_${asset}`,
          operation: "SELL",
          userId: userId,
        });

        await this.mantecaService.postOrder({
          userId: userId,
          amount: getCryptoPrice(body.data.amount, btcToArsPrice.buy),
          coin: `BTC_${asset}`,
          operation: "BUY",
          code: lockPrice.code,
        });
      }
    } catch (error: any) {
      // throw new GenericException({});
    }
  };
}

export default UserService;
