import http from 'node:http';

import express from 'express';
import { Server } from 'socket.io';

import config from './config';
import { httpLogger, log } from './services/logger';
import { registerSocketHandlers } from './socket/handlers';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(httpLogger);

// Static
app.use(express.static('public'));

// Socket handlers
registerSocketHandlers(io);

server.listen(config.PORT, () => {
  log('info', `Server started: http://localhost:${config.PORT}`, {
    port: config.PORT,
  });
});
