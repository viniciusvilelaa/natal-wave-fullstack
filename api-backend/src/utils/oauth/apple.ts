import jwt, { JwtHeader, SigningKeyCallback, JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { ApiError } from "../api-error";

const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getAppleSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error("Header do token da Apple não contém 'kid'"));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AppleTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  emailVerified?: boolean;
}

/**
 * Valida o ID Token da Apple garantindo a verificação de assinatura (via JWKS), expiração,
 * emissor esperado (iss: https://appleid.apple.com) e audiência/Client ID (aud).
 */
export async function verifyAppleToken(idToken: string): Promise<AppleTokenPayload> {
  const appleClientId = process.env.APPLE_CLIENT_ID;
  if (!appleClientId) {
    throw new ApiError(500, "APPLE_CLIENT_ID não configurado no ambiente");
  }

  const expectedIssuer = "https://appleid.apple.com";

  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getAppleSigningKey,
      {
        algorithms: ["RS256"],
        issuer: expectedIssuer,
        audience: appleClientId,
      },
      (err, decoded) => {
        if (err || !decoded) {
          return reject(
            new ApiError(401, `Token da Apple inválido: ${err?.message || "Assinatura ou expiração inválida"}`)
          );
        }

        const payload = decoded as JwtPayload;

        // Validação explícita de ISS (Emissor esperado)
        if (payload.iss !== expectedIssuer) {
          return reject(new ApiError(401, `Emissor (iss) do token da Apple inválido: ${payload.iss}`));
        }

        // Validação explícita de AUD (Client ID esperado)
        if (payload.aud !== appleClientId) {
          return reject(new ApiError(401, `Audiência (aud) do token da Apple incompatível: ${payload.aud}`));
        }

        if (!payload.sub) {
          return reject(new ApiError(401, "Token da Apple não contém a identificação 'sub'"));
        }

        resolve({
          sub: payload.sub,
          email: payload.email,
          emailVerified: payload.email_verified === "true" || payload.email_verified === true,
        });
      }
    );
  });
}
