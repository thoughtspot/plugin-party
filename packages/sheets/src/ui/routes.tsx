export enum Routes {
  HOME = '/',
  SEARCHBAR = '/search-bar',
}

export function getPath(route: Routes, params: any = {}): string {
  return route.replace(/:([^/]+)/g, (match, key) => params[key]);
}
