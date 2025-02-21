import { NewDepositEventBody } from "../interfaces/manteca.interfaces";
import GenericException from "../exceptions/generic.exception";
import { RuleType } from "../interfaces/rule.interface";
import { IRule } from "../interfaces/rule.interface";
import MantecaService from "./manteca.service";
import { Rule } from "../models/rules.model";
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

  private handleError(
    error: unknown,
    defaultInternalStatus: string,
    defaultMessage: string
  ) {
    console.error(`Error in UserService:`, error);

    if (isAxiosError(error)) {
      throw new GenericException({
        status: error.response?.status || 500,
        internalStatus: error?.response?.data.internalStatus || "API_ERROR",
        message: error?.response?.data.message || "Unknown error",
      });
    }

    if (error instanceof GenericException) {
      throw error;
    }

    throw new GenericException({
      status: 500,
      internalStatus: defaultInternalStatus,
      message: defaultMessage,
    });
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
      throw this.handleError(
        error,
        "UNKNOWN_ERROR",
        "Unexpected error while retrieving the user"
      );
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
          internalStatus: "INVALID_RULE",
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
      throw this.handleError(
        error,
        "SET_RULE_ERROR",
        "Unexpected error while adding a new rule"
      );
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
      throw this.handleError(
        error,
        "DELETE_RULE_ERROR",
        "Unexpected error while deleting rule"
      );
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
      throw this.handleError(
        error,
        "GET_RULE_ERROR",
        "Unexpected error while retrieving the rule"
      );
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

      if (!rule) {
        return `Deposit successfull`;
      }

      if (rule?.rule === RuleType.INSTA_INVERSION) {
        const lockPrice = await this.mantecaService.lockPrice({
          coin: `BTC_${asset}`,
          operation: "BUY",
          userId: userId,
        });

        await this.mantecaService.postOrder({
          userId: userId,
          amount: body.data.amount,
          coin: `BTC_${asset}`,
          operation: "BUY",
          code: lockPrice.code,
        });
      }

      if (rule?.rule === RuleType.INSTA_VENTA) {
        const lockPrice = await this.mantecaService.lockPrice({
          coin: `BTC_${asset}`,
          operation: "SELL",
          userId: userId,
        });

        await this.mantecaService.postOrder({
          userId: userId,
          amount: body.data.amount,
          coin: `BTC_${asset}`,
          operation: "SELL",
          code: lockPrice.code,
        });
      }
      return "New order placed successfully";
    } catch (error) {
      throw this.handleError(
        error,
        "DEPOSIT_ERROR",
        "Unexpected error while depositing"
      );
    }
  };
}

export default UserService;
