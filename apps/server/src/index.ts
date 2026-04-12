import http from 'node:http';
import path from 'node:path';

import express from 'express';
import { Server } from 'socket.io';

import config from './config';
import { Env, LogLevel } from './constants';
import qrRouter from './features/qr';
import { httpLogger, log } from './services/logger';
import { openUrlInBrowser } from './services/open';
import { registerSocketHandlers } from './socket/handlers';

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
  if (config.ENV === Env.COMPILE) {
    openUrlInBrowser(`http://localhost:${config.PORT}`);
  }
});
