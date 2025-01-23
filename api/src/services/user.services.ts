import { IRule, RuleType } from "../interfaces/rule.interface";
import { Rule } from "../models/rules.model";

export async function addOrUpdateRule(
  ruleType: RuleType,
  userId: string
): Promise<IRule> {
  try {
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
    console.error("Error in addOrUpdateRule:", error);
    throw new Error("Failed to add or update rule.");
  }
}

export async function deleteRuleByUserId(userId: string) {
  try {
    const result = await Rule.deleteOne({ userId });
    if (result.deletedCount === 0) {
      throw new Error("No rules found for the given userId.");
    }
    return `Rule for user ${userId} deleted successfully.`;
  } catch (error) {
    console.error("Error in deleteRuleByUserId:", error);
    throw new Error("Failed to delete rule(s).");
  }
}

export async function getRuleByUserId(userId: string): Promise<IRule | null> {
  try {
    return await Rule.findOne({ userId });
  } catch (error) {
    console.error("Error in getRuleByUserId:", error);
    throw new Error("Failed to get rule by userId.");
  }
}
