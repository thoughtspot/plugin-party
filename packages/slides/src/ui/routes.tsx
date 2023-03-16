export enum Routes {
  HOME = '/',
  LIST = '/list',
  LIVEBOARD = '/liveboard/:id',
  ANSWER = '/answer/:id',
}

export function getPath(route: Routes, params: any = {}): string {
  return route.replace(/:([^/]+)/g, (match, key) => params[key]);
}
