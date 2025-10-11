import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../libs/errors.js";

import { toUserChirpyRed, getUserById } from "../libs/db/queries/users.js";

import { addJsonHeaders, status } from "../libs/json.js";
import { getApiKeyFromRequest } from "../libs/auth.js";
import { config } from "../config.js";

export async function handlePolkaWebhook(req: Request, res: Response) {
  type IncomeData = {
    event: string;
    data: {
      userId: string;
    };
  };

  const incomingData: IncomeData = req.body;

  let authHeaderToken;

  try {
    authHeaderToken = getApiKeyFromRequest(req);
  } catch {
    throw new UnauthorizedError("Not found API key");
  }

  if (authHeaderToken !== config.api.key) {
    throw new UnauthorizedError("Invalid API key");
  }

  if (incomingData.event !== "user.upgraded") {
    status(addJsonHeaders(res), 204).send();
    return;
  }

  if (!incomingData.data || !incomingData.data.userId) {
    throw new BadRequestError("User ID is required");
  }

  const user = await getUserById(incomingData.data.userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  await toUserChirpyRed(user.id);

  status(addJsonHeaders(res), 204).send();
}
