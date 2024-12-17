import { getInitConfig } from '@thoughtspot/visual-embed-sdk';

export function getTSAnswerLink(answerId) {
  const baseUrl = getInitConfig().thoughtSpotHost;
  return `${baseUrl}/#/saved-answer/${answerId}`;
}

export function getTSLBVizLink(liveboardId, vizId, personalisedViewsId) {
  const baseUrl = getInitConfig().thoughtSpotHost;
  let lBVizLink = `${baseUrl}/#/pinboard/${liveboardId}/${vizId}`;
  if (personalisedViewsId?.id && personalisedViewsId?.id !== '') {
    lBVizLink = `${lBVizLink}?view=${personalisedViewsId.id}`;
  }
  return lBVizLink;
}

export function getOffset(el) {
  let _x = 0;
  let _y = 0;
  while (el && !Number.isNaN(el.offsetLeft) && !Number.isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
}
