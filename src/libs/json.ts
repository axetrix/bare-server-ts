import type { Response } from "express";

export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}

export function json(res: Response): Response {
  return res
    .set("Content-Type", "application/json; charset=utf-8")
}

export function status(res: Response, code: number): Response {
  return res
    .status(code)
}

export function respondWithJSON<T extends {}>(res: Response, code: number, payload: T) {
  res
    .set("Content-Type", "application/json; charset=utf-8")
    .status(code)
    .send(JSON.stringify(payload));
}
