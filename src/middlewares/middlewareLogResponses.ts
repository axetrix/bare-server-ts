import type { Request, Response, NextFunction } from 'express';

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
      if (res.statusCode < 300) {
        return;
      }

      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    });

    next();
}
