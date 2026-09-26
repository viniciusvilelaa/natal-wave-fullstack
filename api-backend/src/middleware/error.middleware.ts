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

  // Erro de parse de JSON do body-parser (ex: vírgula sobrando ou sintaxe inválida)
  if (err instanceof SyntaxError && "status" in err && (err as any).status === 400) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  console.error(err);

  return res.status(500).json({
    error: "Internal server error.",
    ...(env.NODE_ENV === "development" && { detail: err.message }),
  });
}