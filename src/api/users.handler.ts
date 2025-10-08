import { Request, Response } from "express";
import {
  ForbiddenError,
  InternalServerError,
  BadRequestError,
} from "../libs/errors.js";

import {
  removeAllUsers,
  createUser,
} from "../libs/db/queries/users.js";

import { config, isPlatformDev } from "../config.js";

import { respondWithJSON } from "../libs/json.js";

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
