import { hash, verify } from "argon2";
import { sign, verify as verifyJWT } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { UserNotAuthenticatedError } from "./errors";

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function checkPasswordHash(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return await verify(hashedPassword, password);
  } catch (error) {
    return false;
  }
}

export async function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): Promise<string> {
  const payload = {
    iss: TOKEN_ISSUER,
    sub: userID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  } satisfies Payload;

  return sign(payload, secret, { algorithm: "HS256" });
}

export async function validateJWT(
  tokenString: string,
  secret: string,
): Promise<string> {
  let decoded: Payload;

  try {
    decoded = verifyJWT(tokenString, secret, {
      algorithms: ["HS256"],
    }) as JwtPayload;
  } catch (error) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}
