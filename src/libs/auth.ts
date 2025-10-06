import type { Request } from "express";
import { hash, verify } from "argon2";
import jsonwebtoken from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { UserNotAuthenticatedError, AuthHeaderError } from "./errors.js";

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

  return jsonwebtoken.sign(payload, secret, { algorithm: "HS256" });
}

export async function validateJWT(
  tokenString: string,
  secret: string,
): Promise<string> {
  let decoded: Payload;

  try {
    decoded = jsonwebtoken.verify(tokenString, secret, {
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

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throw new AuthHeaderError("No authorization header");
  }

  const [type, token] = authHeader.split(/\s+/);

  if (type !== "Bearer") {
    throw new AuthHeaderError("Invalid token type");
  }

  return token;
}
