import { loadEnvFile } from 'node:process';

try {
  loadEnvFile('.env');
} catch (e: unknown) {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT')
    // eslint-disable-next-line no-console
    console.warn('No .env file found or could not be loaded.');
}

export default {
  ENV:
    (process.env.NODE_ENV as
      | 'development'
      | 'production'
      | 'compile'
      | 'test') || 'development',
  PORT: process.env.PORT || 3000,
  LOG_LEVEL:
    (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
};
