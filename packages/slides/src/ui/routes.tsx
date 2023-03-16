export enum Routes {
  HOME = '/',
  LIST = '/list/:selectedTab',
  ANSWERLIST = '/list/answers',
  LIVEBOARDLIST = '/list/liveboards',
  LIVEBOARD = '/liveboard/:id',
  ANSWER = '/answer/:id',
}

export function getPath(route: Routes, params: any = {}): string {
  return route.replace(/:([^/]+)/g, (match, key) => params[key]);
}
