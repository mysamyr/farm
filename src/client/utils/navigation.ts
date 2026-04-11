import { PATHS } from '../constants';

export function parseHash(): { path: string; params: URLSearchParams } {
  const hash: string = location.hash.replace(/^#/, '') || PATHS.DASHBOARD;
  const [path = PATHS.DASHBOARD, queryString = ''] = hash.split('?');
  const params = new URLSearchParams(queryString);
  return { path, params };
}

export function navTo(path: string = PATHS.DASHBOARD): void {
  location.hash = path;
}
