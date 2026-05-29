import { NextFunction, Request, Response } from "express";

interface IError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const ErrorMiddleware = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stackTrace: error.stack,
      error: error,
    });
  } else {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.isOperational
        ? error.message
        : "Something went wrong! Please try again later.",
    });
  }
};
