import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  JWT_SECRET: z.string().min(10, "JWT_SECRET deve ter pelo menos 10 caracteres"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().default(30),

  STORMGLASS_API_URL: z.string().url().default("https://api.stormglass.io/v2"),
  STORMGLASS_API_KEY: z.string().min(1, "STORMGLASS_API_KEY é obrigatória"),
  FORECAST_CACHE_TTL_HOURS: z.coerce.number().default(3),

  NEARBY_BEACH_RADIUS_KM: z.coerce.number().default(50),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variáveis de ambiente inválidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;