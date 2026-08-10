import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string; // id do usuário
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}