import { Request, Response, NextFunction } from "express";

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Internal Server Error", err);

  res.status(500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
}
