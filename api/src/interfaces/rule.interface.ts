import { Document } from "mongoose";

export enum RuleType {
  INSTA_VENTA = "INSTA_VENTA",
  INSTA_INVERSION = "INSTA_INVERSION",
}

export interface IRule extends Document {
  id: string;
  rule: RuleType;
  updatedAt: Date;
}
