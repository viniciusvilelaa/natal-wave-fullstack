import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../api-error";

const client = new OAuth2Client();

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified?: boolean;
}


//Valida o ID Token do Google garantindo a verificação de assinatura, expiração, emissor esperado (iss) e ID do cliente / audiência (aud).

export async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new ApiError(500, "GOOGLE_CLIENT_ID não configurado no ambiente");
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
  } catch (error: any) {
    throw new ApiError(401, `Token do Google inválido: ${error?.message || "Assinatura ou expiração inválida"}`);
  }

  const payload = ticket.getPayload();
  if (!payload) {
    throw new ApiError(401, "Payload do token do Google é inválido");
  }

  // Validação explícita de ISS (Emissor esperado)
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    throw new ApiError(401, `Emissor (iss) do token do Google inválido: ${payload.iss}`);
  }

  // Validação explícita de AUD (Client ID esperado)
  if (payload.aud !== googleClientId) {
    throw new ApiError(401, `Audiência (aud) do token do Google incompatível: ${payload.aud}`);
  }

  if (!payload.sub || !payload.email) {
    throw new ApiError(401, "Token do Google não contém as informações mínimas de identificação (sub, email)");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    emailVerified: payload.email_verified,
  };
}
