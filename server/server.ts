import http from 'node:http';
import path from 'node:path';

import express from 'express';
import { Server } from 'socket.io';

import config from './config';
import qrRouter from './features/qr';
import { httpLogger, log } from './services/logger';
import { openUrlInBrowser } from './services/open';
import { registerSocketHandlers } from './socket/handlers';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingInterval: 25000,
  pingTimeout: 120000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 5 * 60 * 1000,
  },
});

app.use(httpLogger);
app.use(qrRouter);

app.use(express.static(path.join(__dirname, '..', 'public')));

registerSocketHandlers(io);

server.listen(config.PORT, (): void => {
  log('info', `Server started: http://localhost:${config.PORT}`, {
    port: config.PORT,
  });
  if (config.ENV === 'production') {
    openUrlInBrowser(`http://localhost:${config.PORT}`);
  }
});
