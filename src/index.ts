import express from "express";

import "./libs/db/auto-migrate.js"

import { middlewareLogResponses } from "./middlewares/middlewareLogResponses.js";
import { middlewareFileServerHits } from "./middlewares/middlewareFileServerHits.js";
import { errorMiddleware } from "./middlewares/error-middleware.js";

import { handleChirpCreate, handleGetAllChirps, handleGetChirp } from "./api/chirp.handler.js";
import { handleUsersRemove, handleUserCreate, handleUserLogin } from "./api/users.handler.js";

import { config } from './config.js';

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);
app.use('/app', middlewareFileServerHits);

app.use('/app', express.static('./src/app'));
app.get('/api/healthz', (req: express.Request, res: express.Response) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send('OK');
});

app.get('/admin/metrics', (req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
      </body>
    </html>
  `);
});

app.get('/api/chirps', handleGetAllChirps);
app.post('/api/chirps', handleChirpCreate);
app.get('/api/chirps/:id', handleGetChirp);

app.post('/api/users', handleUserCreate);
app.post('/api/login', handleUserLogin);
app.post('/admin/reset', handleUsersRemove);


app.use(errorMiddleware);

app.listen(config.api.port, () => {
  console.log(`Server is running on port ${config.api.port}`);
});
