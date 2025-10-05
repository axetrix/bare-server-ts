import type { Request, Response, NextFunction } from 'express';

import { config } from '../config.js';

export function middlewareFileServerHits(req: Request, res: Response, next: NextFunction) {
  config.api.fileserverHits += 1;

  next();
}
