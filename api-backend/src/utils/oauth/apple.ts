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
    return callback(new Error("Apple token header does not contain 'kid'"));
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
 * Validates Apple ID Token verifying signature (via JWKS), expiration,
 * expected issuer (iss: https://appleid.apple.com) and audience/Client ID (aud).
 */
export async function verifyAppleToken(idToken: string): Promise<AppleTokenPayload> {
  const appleClientId = process.env.APPLE_CLIENT_ID;
  if (!appleClientId) {
    throw new ApiError(500, "APPLE_CLIENT_ID is not configured in environment");
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
            new ApiError(401, `Invalid Apple token: ${err?.message || "Invalid signature or expiration date."}`)
          );
        }

        const payload = decoded as JwtPayload;

        // Validação explícita de ISS (Emissor esperado)
        if (payload.iss !== expectedIssuer) {
          return reject(new ApiError(401, `Invalid Apple token issuer (iss): ${payload.iss}`));
        }

        // Validação explícita de AUD (Client ID esperado)
        if (payload.aud !== appleClientId) {
          return reject(new ApiError(401, `Apple token audience (aud) is incompatible: ${payload.aud}`));
        }

        if (!payload.sub) {
          return reject(new ApiError(401, "Apple token does not contain 'sub' identification"));
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
