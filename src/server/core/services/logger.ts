import config from '../../config';
import { LogLevel } from '../../constants';

import type { Request, Response, NextFunction } from 'express';

const levels: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 10,
  [LogLevel.INFO]: 20,
  [LogLevel.WARN]: 30,
  [LogLevel.ERROR]: 40,
};

export function log(
  level: LogLevel,
  msg: string,
  meta?: Record<string, unknown>
) {
  if (levels[level] < levels[config.LOG_LEVEL]) return;
  const time = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : '';
  // eslint-disable-next-line no-console
  console.log(`[${time}] [${level.toUpperCase()}] ${msg}${payload}`);
}

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    log(LogLevel.DEBUG, 'http', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      ms,
    });
  });
  next();
}
