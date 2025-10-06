import { Request, Response } from "express";
import {
  ForbiddenError,
  InternalServerError,
  BadRequestError,
  UnauthorizedError,
} from "../libs/errors.js";

import {
  removeAllUsers,
  createUser,
  getUserByEmail,
} from "../libs/db/queries/users.js";

import { config, isPlatformDev } from "../config.js";

import { respondWithJSON } from "../libs/json.js";
import { checkPasswordHash, makeJWT } from "../libs/auth.js";

export const handleUsersRemove = async (req: Request, res: Response) => {
  if (!isPlatformDev(config.app.platform)) {
    throw new ForbiddenError(`Admin reset is only allowed in development mode`);
  }

  const isAllUsersRemoved = await removeAllUsers();

  if (!isAllUsersRemoved) {
    throw new InternalServerError("Failed to remove all users");
  }

  respondWithJSON(res, 200, { message: "All users removed successfully" });
};

export async function handleUserCreate(req: Request, res: Response) {
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

  const user = await createUser(data.email, data.password);

  if (!user) {
    throw new InternalServerError("Failed to create user");
  }

  respondWithJSON(res, 201, user);
}

export async function handleUserLogin(req: Request, res: Response) {
  type IncomeData = {
    email: string;
    password: string;
    expiresInSeconds?: number;
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

  const expiresInSeconds =
    data.expiresInSeconds && data.expiresInSeconds < 3600
      ? data.expiresInSeconds
      : 3600;

  const token = await makeJWT(user.id, expiresInSeconds, config.app.secret);

  const { hashedPassword, ...safeUser } = user;

  respondWithJSON(res, 200, {
    ...safeUser,
    token,
  });
}
