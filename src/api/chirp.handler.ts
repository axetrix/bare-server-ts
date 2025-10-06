import { Request, Response } from "express";
import { InternalServerError, BadRequestError, NotFoundError, UnauthorizedError } from "../libs/errors.js";

import { createChirp, getChirps, getChirpById } from "../libs/db/queries/chirps.js";

import { respondWithJSON } from "../libs/json.js";
import { getBearerToken, validateJWT } from "../libs/auth.js";
import { config } from "../config.js";

const DISABLED_WORDS = ["kerfuffle", "sharbert", "fornax"];

export async function handleChirpCreate(req: Request, res: Response) {
  type Params = {
    body: string;
  };

  const data: Params = req.body;

  let userId;

  try {
    userId = await validateJWT(getBearerToken(req), config.app.secret);
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }

  if (!data.body) {
    throw new BadRequestError(
      `Provided data is invalid. Missing body`,
    );
  }

  if (!userId) {
    throw new BadRequestError("User ID is missing");
  }

  if (data.body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const body = data.body.split(" ");
  const bodyMapped = body.map((word) => {
    if (DISABLED_WORDS.includes(word.toLocaleLowerCase())) {
      return "****";
    }

    return word;
  });

  const cleanedBody = bodyMapped.join(" ");

  const chirp = await createChirp({
    body: cleanedBody,
    userId: userId,
  });

  if (!chirp) {
    throw new InternalServerError("Failed to create chirp");
  }

  respondWithJSON(res, 201, chirp);
}


export async function handleGetAllChirps(req: Request, res: Response) {
  const chirps = await getChirps();

  respondWithJSON(res, 200, chirps);
}

export async function handleGetChirp(req: Request, res: Response) {
  const id = req.params.id;

  if (!id) {
    throw new BadRequestError(`Provided id is invalid`);
  }

  const chirp = await getChirpById(id);

  if (!chirp) {
    throw new NotFoundError(`Chirp with id ${id} not found`);
  }

  respondWithJSON(res, 200, chirp);
}
