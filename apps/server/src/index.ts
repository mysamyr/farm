import http from 'node:http';
import path from 'node:path';

import express from 'express';
import { Server } from 'socket.io';

import config from './config/index.js';
import { LogLevel } from './constants/index.js';
import { gameRegistry } from './games/index.js';
import { httpLogger, log } from './services/logger.js';
import { registerSocketHandlers } from './socket/handlers.js';

import type { AppServer } from './types/index.js';

const app = express();
const server = http.createServer(app);
const io: AppServer = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60 * 1000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 60 * 1000,
  },
});

app.use(httpLogger);

// API endpoint to get available games
app.get('/api/games', (_req, res) => {
  res.json(gameRegistry.getAllMetadata());
});

registerSocketHandlers(io);

const clientPath = path.join(process.cwd(), 'apps/client/dist');
app.use(express.static(clientPath));

app.get(/.*/, (_, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

server.listen(config.PORT, (): void => {
  log(LogLevel.INFO, `Server started: http://localhost:${config.PORT}`, {
    port: config.PORT,
  });
});
