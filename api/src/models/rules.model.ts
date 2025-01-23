import mongoose, { Schema, Document } from "mongoose";
import { IRule, RuleType } from "../interfaces/rule.interface";

const RuleSchema: Schema = new Schema({
  userId: { type: String, required: true },
  rule: {
    type: String,
    enum: RuleType,
    nullable: true,
  },
  updatedAt: { type: Date, default: Date.now },
});

export const Rule = mongoose.model<IRule>("rules", RuleSchema);
