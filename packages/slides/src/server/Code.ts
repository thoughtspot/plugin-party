/**
 * @OnlyCurrentDoc
 */

/* eslint no-var: 0 */
var module;

function onOpen() {
  SlidesApp.getUi()
    .createMenu('ThoughtSpot Connected Slides')
    .addItem('Launch', 'showTSSidebar')
    .addSeparator()
    .addItem('Reset instance url', 'resetTSInstance')
    .addToUi();
}

function showTSSidebar() {
  const widget = HtmlService.createHtmlOutputFromFile('index.html');
  widget.setTitle('ThoughtSpot');
  SlidesApp.getUi().showSidebar(widget);
}

function showTSDialog() {
  const widget = HtmlService.createHtmlOutputFromFile('dialog.html');
  widget.setTitle('ThoughtSpot');
  SlidesApp.getUi().showModalDialog(widget, 'Thoughtspot');
}

function resetTSInstance() {
  const userProps = PropertiesService.getUserProperties();
  userProps.deleteProperty('ts-cluster-url');
}

function getCandidateClusterUrl() {
  console.log('Hu0');
  const email = Session.getActiveUser().getEmail();
  const domain = email.substring(email.indexOf('@') + 1);
  let clusterName = domain.substring(0, domain.indexOf('.'));
  console.log('Hu1', email);
  let environment = 'thoughtspot';
  if (clusterName === 'thoughtspot') {
    clusterName = 'champagne';
    environment = 'thoughtspotstaging';
  }
  if (clusterName === 'gmail') {
    clusterName = 'my1';
  }
  console.log('reached', clusterName, environment);
  return `${clusterName}.${environment}.cloud`;
}

function getClusterUrl() {
  const userProps = PropertiesService.getUserProperties();
  if (userProps.getProperty('ts-cluster-url')) {
    return {
      url: userProps.getProperty('ts-cluster-url'),
      isCandidate: false,
    };
  }
  return {
    url: getCandidateClusterUrl(),
    isCandidate: true,
  };
}

function setClusterUrl(url) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty(
    'ts-cluster-url',
    url.replace('https://', '').replace('#', '').replace(/\/+$/, '')
  );
}

function setToken(token, ttl) {
  const userCache = CacheService.getUserCache();
  userCache.put('ts-auth-token', token, ttl);
}

function getAnswerImageRequest(answerId) {
  const userCache = CacheService.getUserCache();
  const token = userCache.get('ts-auth-token');
  const clusterUrl = getClusterUrl().url;
  const url = `https://127.0.0.1:5173/api/report/answer?url=${clusterUrl}&answerId=${answerId}&token=${token}`;
  return {
    url,
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      metadata_identifier: answerId,
      file_format: 'PNG',
    }),
  };
}

function getLiveboardImageRequest({ liveboardId, vizId }) {
  const userCache = CacheService.getUserCache();
  const token = userCache.get('ts-auth-token');
  const clusterUrl = getClusterUrl().url;
  const url = `https://${clusterUrl}/api/rest/2.0/report/liveboard`;
  return {
    url,
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: JSON.stringify({
      metadata_identifier: liveboardId,
      visualization_identifiers: [vizId],
      file_format: 'PNG',
    }),
  };
}

function getImageMetadata(link) {
  if (link.indexOf('saved-answer') > -1) {
    const answerId = link.split('/').pop();
    return {
      type: 'ANSWER',
      id: answerId,
    };
  }
  if (link.indexOf('pinboard') > -1) {
    const linkParts = link.split('/');
    const vizId = linkParts.pop();
    const liveboardId = linkParts.pop();
    return {
      type: 'LIVEBOARD',
      id: liveboardId,
      vizId,
    };
  }
  return {
    type: 'UNKNOWN',
  };
}

function getImagesRaw(links) {
  const metadatas = links.map(getImageMetadata);
  const fetchRequests = metadatas.map((metadata) => {
    if (metadata.type === 'ANSWER') {
      return getAnswerImageRequest(metadata.id);
    }
    if (metadata.type === 'LIVEBOARD') {
      return getLiveboardImageRequest({
        liveboardId: metadata.id,
        vizId: metadata.vizId,
      });
    }
    return null;
  });

  console.log('response', fetchRequests);

  const responses = UrlFetchApp.fetchAll(fetchRequests);

  return responses.map((response) => response.getBlob());
}

function deserializeToBlob(serialized) {
  const bytes = Utilities.base64Decode(serialized);
  return Utilities.newBlob(bytes, 'image/png', 'image.png');
}

function serializeBlob(blob) {
  return Utilities.base64Encode(blob.getBytes());
}

function getImages(links, skipCache = true) {
  const cache = new BlobCache(CacheService.getScriptCache());
  const linksToFetch: string[] = [];
  const linkToFetchHash = {};

  // This map has side effects :)
  const linkRefs = links.map((link) => {
    if (!skipCache && cache.has(link)) {
      console.log('cache hit', link);
      return [link, cache.getBlob(link)];
    }
    if (linkToFetchHash[link]) {
      return [link, linkToFetchHash[link]];
    }
    const idx = linksToFetch.length;
    linksToFetch.push(link);
    linkToFetchHash[link] = idx;
    return [link, idx];
  });

  console.log('linksToFetch', linksToFetch.length);
  const blobs = getImagesRaw(linksToFetch);
  return linkRefs.map((linkRef) => {
    const link = linkRef[0];
    const ref = linkRef[1];
    if (typeof ref === 'number') {
      const blob = blobs[ref];
      cache.putBlob(link, blob);
      return blob;
    }
    return ref;
  });
}

function addImage(link) {
  const currentPage = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const slide = currentPage.asSlide();
  const blobs = getImages([link]);
  const img = slide.insertImage(blobs[0]);
  img.setLinkUrl(link);
}

function preCacheImage(link) {
  const blobs = getImages([link]);
  return blobs[0];
}

function reloadImages(images) {
  const errorImageLinks = [];
  const currentCluster = getClusterUrl().url;
  const tsImages = images.filter((image) => {
    if (image.getLink()) {
      return (
        (image.getLink().getUrl().indexOf('/pinboard/') > -1 ||
          image.getLink().getUrl().indexOf('/saved-answer/') > -1) &&
        image.getLink().getUrl().indexOf(currentCluster) > -1
      );
    }
    return false;
  });
  const tsImageLinks = tsImages.map((image) => image.getLink().getUrl());
  const blobs = getImages(tsImageLinks, true);
  tsImages.forEach((image) => {
    const blob = blobs.shift();
    try {
      image.replace(blob);
    } catch (e) {
      errorImageLinks.push(image.getLink().getUrl());
    }
  });
  return errorImageLinks;
}

function reloadImagesInCurrentSlide() {
  const currentPage = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const slide = currentPage.asSlide();
  const images = slide.getImages();
  return reloadImages(images);
}

function reloadImagesInPresentation() {
  const slides = SlidesApp.getActivePresentation().getSlides();
  console.log(slides, slides.length, typeof slides);
  const slideImages = slides.reduce((imgs, slide) => {
    const images = slide.getImages();
    return imgs.concat(images);
  }, []);
  return reloadImages(slideImages);
}
if (module?.exports) {
  module.exports.resetTSInstance = resetTSInstance;
  module.exports.getCandidateClusterUrl = getCandidateClusterUrl;
  module.exports.getClusterUrl = getClusterUrl;
  module.exports.setClusterUrl = setClusterUrl;
  module.exports.setToken = setToken;
  module.exports.getAnswerImageRequest = getAnswerImageRequest;
  module.exports.getLiveboardImageRequest = getLiveboardImageRequest;
  module.exports.getImageMetadata = getImageMetadata;
  module.exports.getImagesRaw = getImagesRaw;
}
