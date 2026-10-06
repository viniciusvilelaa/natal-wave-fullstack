import { NextFunction, Request, Response } from "express";
import { Schema, ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

// Express 5 exposes req.query as a read-only getter, so the parsed query lives in res.locals.query
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.query = schema.parse(req.query);
    next()
  }
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.params = schema.parse(req.params) as any;
    next();
  };
}