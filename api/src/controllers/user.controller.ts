import { RequestHandler } from "express";
import UserService from "../services/user.services";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = UserService.getInstance();
  }

  public getUser: RequestHandler = async (req, res, next) => {
    const userId: string = req.params.userId;
    console.log(userId);

    try {
      const user = await this.userService.getUser(userId);
      res.status(200).send(user);
    } catch (err) {
      next(err);
    }
  };

  public deleteRule: RequestHandler = async (req, res, next) => {
    const userId: string = req.params.userId;

    try {
      const user = await this.userService.deleteRuleByUserId(userId);
      res.status(200).send(user);
    } catch (err) {
      next(err);
    }
  };

  public addNewRule: RequestHandler = async (req, res, next) => {
    const userId: string = req.params.userId;
    const ruleType = req.body?.ruleType;

    try {
      const user = await this.userService.setRule(ruleType, userId);
      res.status(201).send(user);
    } catch (err) {
      next(err);
    }
  };

  public depositWebhook: RequestHandler = async (req, res, next) => {
    try {
      const response = await this.userService.postDeposit(req.body);
      res.status(201).send(response);
    } catch (err) {
      next(err);
    }
  };
}
