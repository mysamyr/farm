import { join } from 'node:path';
import { loadEnvFile } from 'node:process';

import { log } from '../services/logger';

try {
  loadEnvFile(join(__dirname, '..', '..', '.env'));
} catch (e: unknown) {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT')
    log('warn', 'No .env file found or could not be loaded.');
}

export default {
  ENV:
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development',
  PORT: process.env.PORT || 3000,
  LOG_LEVEL:
    (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
};
