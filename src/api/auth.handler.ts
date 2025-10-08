import { Request, Response } from "express";
import {
  InternalServerError,
  BadRequestError,
  UnauthorizedError,
} from "../libs/errors.js";

import {
  getUserByEmail,
} from "../libs/db/queries/users.js";

import {
  createRefreshToken,
  getRefreshToken,
  getRefreshTokenByUserId,
  revokeRefreshToken
} from "../libs/db/queries/refresh-tokens.js";

import { config } from "../config.js";

import { respondWithJSON, json, status } from "../libs/json.js";
import { checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken, validateJWT } from "../libs/auth.js";
import { RefreshToken } from "src/libs/db/schema.js";

type LoginResponse = {
  id: string;
  email: string;
  token: string,
  refreshToken: string;
};

export async function handleUserLogin(req: Request, res: Response) {
  type IncomeData = {
    email: string;
    password: string;
  };

  const data: IncomeData = req.body;

  if (!data.email) {
    throw new BadRequestError("Email is required");
  }

  if (!data.password) {
    throw new BadRequestError("Password is required");
  }

  const user = await getUserByEmail(data.email);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!(await checkPasswordHash(data.password, user.hashedPassword))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  let refreshToken = await getRefreshTokenByUserId(user.id);

  if (!refreshToken) {
    refreshToken = await createRefreshToken(makeRefreshToken(), user.id, 60 * 60 * 24);
  }

  if (!refreshToken) {
    throw new InternalServerError("Failed to create refresh token");
  }

  const token = await makeJWT(user.id, 3600, config.app.secret);

  const { hashedPassword, ...safeUser } = user;

  respondWithJSON(res, 200, {
    id: safeUser.id,
    email: safeUser.email,
    token,
    refreshToken: refreshToken.token,
  } satisfies LoginResponse);
}

type RefreshResponse = {
  token: string,
};

export async function handleRefreshToken(req: Request, res: Response) {
  let refreshToken: RefreshToken | undefined;

  try {
    refreshToken = await getRefreshToken(getBearerToken(req));
  } catch {
    throw new UnauthorizedError("Invalid token");
  }

  if (!refreshToken) {
    throw new UnauthorizedError("No token found");
  }

  if (refreshToken.revoked_at) {
    throw new UnauthorizedError("Token expired");
  }

  const userId = refreshToken.userId;

  // const newRefreshToken = await createRefreshToken(makeRefreshToken(), userId, 60 * 60 * 24);

  // if (!newRefreshToken) {
  //   throw new InternalServerError("Failed to create refresh token");
  // }

  const newToken = await makeJWT(userId, 3600, config.app.secret);

  respondWithJSON(res, 200, {
    token: newToken,
  } satisfies RefreshResponse);
}


export async function handleRevokerToken(req: Request, res: Response) {
  let refreshToken: RefreshToken | undefined;

  try {
    refreshToken = await getRefreshToken(getBearerToken(req));
  } catch {
    throw new UnauthorizedError("Invalid token");
  }

  if (!refreshToken) {
    throw new UnauthorizedError("No token found");
  }

  if (refreshToken.revoked_at) {
    throw new UnauthorizedError("Token expired");
  }

  const isRevoked = await revokeRefreshToken(refreshToken.token);

  if (!isRevoked) {
    throw new InternalServerError("Failed to revoke refresh token");
  }

  status(json(res), 204).send();
}
