import { RequestHandler } from "express";

export class HealthController {
  public getHealth: RequestHandler = async (req, res, next) => {
    res.status(200).send("API alive");
  };
}
