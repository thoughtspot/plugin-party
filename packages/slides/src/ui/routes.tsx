export enum Routes {
  HOME = '/',
  LIST = '/list/:selectedTab',
  ANSWERLIST = '/list/answers',
  LIVEBOARDLIST = '/list/liveboards',
  LIVEBOARD = '/liveboard/:id',
  ANSWER = '/answer/:id',
  POWERPOINT = '/powerpoint.html?et=',
  POWERPOINT_PRODUCTION = '/index.html?et=',
}

export function getPath(route: Routes, params: any = {}): string {
  return route.replace(/:([^/]+)/g, (match, key) => params[key]);
}
