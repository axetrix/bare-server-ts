import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../libs/errors.js";

import { toUserChirpyRed, getUserById } from "../libs/db/queries/users.js";

import { addJsonHeaders, status } from "../libs/json.js";

export async function handlePolkaWebhook(req: Request, res: Response) {
  type IncomeData = {
    event: string;
    data: {
      userId: string;
    };
  };

  const incomingData: IncomeData = req.body;

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
