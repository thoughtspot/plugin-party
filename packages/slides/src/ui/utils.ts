import { getInitConfig } from '@thoughtspot/visual-embed-sdk';

export function getTSAnswerLink(answerId) {
  const baseUrl = getInitConfig().thoughtSpotHost;
  return `${baseUrl}/#/saved-answer/${answerId}`;
}
