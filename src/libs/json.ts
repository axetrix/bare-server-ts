import type { Response } from "express";

export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}

export function addJsonHeaders(res: Response): Response {
  return res
    .set("Content-Type", "application/json; charset=utf-8")
}

export function status(res: Response, code: number): Response {
  return res
    .status(code)
}

export function sendJson<T extends {}>(res: Response, payload: T): Response {
  return addJsonHeaders(res).send(JSON.stringify(payload));
}

export function respondWithJSON<T extends {}>(res: Response, code: number, payload: T) {
  sendJson(status(res, code), payload);
}
