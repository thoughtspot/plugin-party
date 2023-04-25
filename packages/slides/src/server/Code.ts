/**
 * @OnlyCurrentDoc
 */

function onOpen() {
  SlidesApp.getUi()
    .createMenu('ThoughtSpot Connected Slides')
    .addItem('Launch', 'showTSSidebar')
    .addSeparator()
    .addItem('Reset', 'resetTSInstance')
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
    url.replace('https://', '').replace('#', '').replaceAll(/\/$/, '')
  );
}

function addImageTest() {
  const slide = SlidesApp.getActivePresentation().getSlides()[0];
  const images = slide.getImages().length;
  console.log('rifnirfnrf', images);
  const slideimage = slide.getImages()[0];
  const currentslide = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const currentslideimages = currentslide.getImages().length;
  const currentslideimage = currentslide.getImages();
  if (currentslideimages === 0) {
    console.log('in', slide, slideimage, currentslide);
    // slide.insertImage('https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png', 250, 37, 350 , 350);
    // slide.insertTextBox('Eagle');
    currentslide.insertImage(
      'https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png',
      250,
      37,
      350,
      350
    );
    currentslide.insertTextBox('Eagle');
  } else {
    SlidesApp.getUi().alert('Already added');
  }
  // currentslide.insertImage('https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png', 250, 37, 350 , 350);
  // currentslide.insertTextBox('Eagle');
}

function updateImage() {
  const slide = SlidesApp.getActivePresentation().getSlides()[0];
  const images = slide.getImages().length;
  console.log('rifnirfnrf', images);
  const slideimage = slide.getImages()[0];
  const currentslide = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const currentslideimages = currentslide.getImages().length;
  const currentslideimage = currentslide.getImages()[0];
  if (currentslideimages === 0) {
    SlidesApp.getUi().alert('Add LB first');
  } else {
    console.log('ierfrefn', slide, slideimage, currentslide);
    // slideimage.remove();
    // slide.insertImage('https://amymhaddad.s3.amazonaws.com/morocco-blue.png', 250, 37, 350 , 350);
    currentslide.replaceAllText('Eagle', 'blue');
    currentslideimage.replace(
      'https://amymhaddad.s3.amazonaws.com/morocco-blue.png',
      true
    );
    // slide.replaceAllText('Eagle','blue');
  }
  // currentslide.insertImage('https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png', 250, 37, 350 , 350);
  // currentslide.insertTextBox('Eagle');
}

function clearSlide() {
  const currentslideelements = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage()
    .getPageElements();
  // console.log(currentslideelements);
  // currentslideelements[0].remove();
  // currentslideelements[1].remove();
  currentslideelements.forEach(function (element) {
    console.log(element);
    element.remove();
  });
  // currentslideelements.forEach((s) => {console.log(s)});
}

function settext(text) {
  const currentslide = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const elements = currentslide.getPageElements();
  console.log('Elements found', elements);
  // await clearSlide();
  console.log('cleared');
  currentslide.insertTextBox(text, 0, 0, 400, 400);
}

function setToken(token, ttl) {
  const userCache = CacheService.getUserCache();
  userCache.put('ts-auth-token', token, ttl);
}

function getAnswerImageRequest(answerId) {
  const userCache = CacheService.getUserCache();
  const token = userCache.get('ts-auth-token');
  const clusterUrl = getClusterUrl().url;
  const url = `https://${clusterUrl}/api/rest/2.0/report/answer`;
  return {
    url,
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

function getImages(links, skipCache = false) {
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
    return (
      (image.getLink().getUrl().indexOf('/pinboard/') > -1 ||
        image.getLink().getUrl().indexOf('/saved-answer/') > -1) &&
      image.getLink().getUrl().indexOf(currentCluster) > -1
    );
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
