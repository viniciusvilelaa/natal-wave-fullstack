// src/middlewares/error.middleware.ts
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error";
import { env } from "../config/env";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Error of validation.",
      issues: err.flatten().fieldErrors,
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "Internal server error.",
    ...(env.NODE_ENV === "development" && { detail: err.message }),
  });
}