import { randomBytes, createHash } from "node:crypto";
import { env } from "../config/env";

const REFRESH_TOKEN_BYTES = 64;

/**
 * Gera um refresh token opaco (não é JWT, só uma string aleatória segura).
 * Esse valor cru é o que vai pro app e é salvo no expo-secure-store.
*/

export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

/**
 * Faz o hash do token cru pra salvar/comparar no banco (coluna tokenHash).
 */

export function hashRefreshToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Calcula a data de expiração a partir de agora, usando o valor configurado no env.
 */
export function getRefreshTokenExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return expiresAt;
}