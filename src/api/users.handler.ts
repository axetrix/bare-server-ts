import { Request, Response } from "express";
import {
  ForbiddenError,
  InternalServerError,
  BadRequestError,
  UnauthorizedError,
} from "../libs/errors.js";

import { User } from "../libs/db/schema.js";
import {
  removeAllUsers,
  createUser,
  updateUser,
} from "../libs/db/queries/users.js";

import { config, isPlatformDev } from "../config.js";

import { respondWithJSON } from "../libs/json.js";
import { hashPassword, getBearerToken, validateJWT } from "../libs/auth.js";

type UserResponse = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isChirpyRed: boolean;
};

function formatUserToResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  };
}

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

  const hashedPassword = await hashPassword(data.password);
  const user = await createUser(data.email, hashedPassword);

  if (!user) {
    throw new InternalServerError("Failed to create user");
  }

  respondWithJSON(res, 201, formatUserToResponse(user));
}

export async function handleUserUpdate(req: Request, res: Response) {
  type IncomeData = {
    email?: string;
    password?: string;
  };

  const data: IncomeData = req.body;

  let userId;

  try {
    userId = await validateJWT(getBearerToken(req), config.app.secret);
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }

  if (!userId) {
    throw new UnauthorizedError("Invalid token - user id not provided");
  }

  if (!data.email && !data.password) {
    throw new BadRequestError(`Email or password are required`);
  }

  const hashedPassword = data.password
    ? await hashPassword(data.password)
    : undefined;

  const user = await updateUser(userId, {
    email: data.email,
    hashedPassword,
  });

  if (!user) {
    throw new InternalServerError("Failed to modify user");
  }

  respondWithJSON(res, 200, formatUserToResponse(user));
}
