import { Request, Response, NextFunction } from "express";
import axios from "axios";

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // console.error("Internal Server Error", err);
  let error = "Internal Server Error";
  let statusCode = 500;

  if (axios.isAxiosError(err)) {
    statusCode = err.response?.status ?? 500;
    error = err.response?.data.message;
  } else if (err?.message) {
    error = err.message;
  }

  res.status(statusCode).json({
    message: error,
  });
}
