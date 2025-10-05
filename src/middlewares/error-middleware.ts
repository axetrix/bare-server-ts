import { Request, Response, NextFunction } from "express";

import { respondWithError } from "../libs/json.js";
import { HTTPError } from "../libs/errors.js";

export async function errorMiddleware(err: Error, _: Request, res: Response, __: NextFunction) {
  if (err instanceof HTTPError) {
    respondWithError(res, err.status, err.message);
    return;
  }

  respondWithError(res, 500, "Something went wrong on our end");
}
