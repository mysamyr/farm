import http from 'node:http';
import path from 'node:path';

import express from 'express';
import { Server } from 'socket.io';

import config from './config';
import { Env, LogLevel } from './constants';
import qrRouter from './core/features/qr';
import { httpLogger, log } from './core/services/logger';
import { openUrlInBrowser } from './core/services/open';
import { registerSocketHandlers } from './core/socket/handlers';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60 * 1000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 60 * 1000,
  },
});

app.use(httpLogger);
app.use(qrRouter);

app.use(express.static(path.join(__dirname, '..', '..', 'public')));

registerSocketHandlers(io);

server.listen(config.PORT, (): void => {
  log(LogLevel.INFO, `Server started: http://localhost:${config.PORT}`, {
    port: config.PORT,
  });
  if (config.ENV === Env.COMPILE) {
    openUrlInBrowser(`http://localhost:${config.PORT}`);
  }
});
