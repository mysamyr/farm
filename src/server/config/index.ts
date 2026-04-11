import { loadEnvFile } from 'node:process';

import { Env, LogLevel } from '../constants';

try {
  loadEnvFile('.env');
} catch (e: unknown) {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT')
    // eslint-disable-next-line no-console
    console.warn('No .env file found or could not be loaded.');
}

export default {
  ENV: (process.env.NODE_ENV as Env) || Env.DEVELOPMENT,
  PORT: Number(process.env.PORT) || 3000,
  LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
} satisfies {
  ENV: Env;
  PORT: number;
  LOG_LEVEL: LogLevel;
};
