import { spawn } from 'node:child_process';
import os from 'node:os';

const commands = (): [string] | [string, string[]] => {
  switch (os.platform()) {
    case 'android':
    case 'linux':
      return ['xdg-open'];
    case 'darwin':
      return ['open'];
    case 'win32':
      return ['cmd', ['/c', 'start', '']];
    default:
      throw new Error('Platform is not supported');
  }
};

export const openUrlInBrowser = (url: string) => {
  try {
    const [command, args = []] = commands();
    const child = spawn(command, [...args, encodeURI(url)], {
      stdio: 'ignore',
      detached: true,
    });

    if (typeof child.unref === 'function') child.unref();
  } catch (e) {
    try {
      process.stderr.write(String(e) + '\n');
    } catch {}
  }
};
