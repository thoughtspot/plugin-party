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
      isError: false,
    };
  }
  return {
    url: getCandidateClusterUrl(),
    isCandidate: true,
    isError: false,
  };
}

function setClusterUrl(url) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty(
    'ts-cluster-url',
    url.replace('https://', '').split('/')[0]
  );
}

function setToken(token, ttl) {
  const userCache = CacheService.getUserCache();
  userCache.put('ts-auth-token', token, ttl);
}

/**
 * Retrieves the image request for a given answer ID.
 *
 * @param {string} answerId - The identifier of the answer.
 * @returns {object} - The image request object.
 */
function getAnswerImageRequest(answerId) {
  const userCache = CacheService.getUserCache();
  const token = userCache.get('ts-auth-token');
  const clusterUrl = getClusterUrl().url;
  const url = 'https://ts-plugin-66ewbkywoa-uw.a.run.app/api/proxy';
  const answerReportPayload = {
    metadata_identifier: answerId,
    file_format: 'PNG',
  };
  return {
    url,
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      clusterUrl,
      endpoint: 'api/rest/2.0/report/answer',
      token,
      payload: answerReportPayload,
    }),
  };
}

/**
 * Retrieves the request object for generating a liveboard image.
 * @param liveboardId - The identifier of the liveboard.
 * @param vizId - The identifier of the visualization.
 * @returns The request object.
 */
function getLiveboardImageRequest({ liveboardId, vizId, personalisedViewId }) {
  const userCache = CacheService.getUserCache();
  const token = userCache.get('ts-auth-token');
  const clusterUrl = getClusterUrl().url;
  const liveboardReportPayload: {
    metadata_identifier: string;
    visualization_identifiers: string[];
    file_format: string;
    png_options?: { personalised_view_id: string };
  } = {
    metadata_identifier: liveboardId,
    visualization_identifiers: [vizId],
    file_format: 'PNG',
  };
  if (personalisedViewId) {
    liveboardReportPayload.png_options = {
      personalised_view_id: personalisedViewId,
    };
  }
  const url = 'https://ts-plugin-66ewbkywoa-uw.a.run.app/api/proxy';
  return {
    url,
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      clusterUrl,
      endpoint: 'api/rest/2.0/report/liveboard',
      token,
      payload: liveboardReportPayload,
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
    const vizId = linkParts.pop().split('?')[0];
    const liveboardId = linkParts.pop();

    // Check for personalised view in the query parameters
    let personalisedViewId;

    // Check if the URL contains a query string
    if (link.indexOf('?') > -1) {
      const queryString = link.split('?')[1];
      if (queryString.indexOf('=') > -1) {
        personalisedViewId = queryString.split('=')[1];
      }
    }

    const imageMetadata: {
      type: string;
      id: any;
      vizId: any;
      personalisedViewId?: string;
    } = {
      type: 'LIVEBOARD',
      id: liveboardId,
      vizId,
    };
    if (personalisedViewId) {
      imageMetadata.personalisedViewId = personalisedViewId;
    }
    return imageMetadata;
  }
  return {
    type: 'UNKNOWN',
  };
}

/**
 * Retrieves images from the given links.
 *
 * @param {string[]} links - An array of links to the images.
 * @returns {Blob[]} An array of Blob objects representing the images.
 */
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
        personalisedViewId: metadata.personalisedViewId,
      });
    }
    return null;
  });

  const responses = UrlFetchApp.fetchAll(fetchRequests);

  return responses.map((response) => {
    console.log('Blob response', response.getResponseCode());
    if (response.getResponseCode() !== 200) {
      return { errorCode: response.getResponseCode() };
    }
    const blob = Utilities.newBlob(response.getContent());
    return blob;
  });
}

const mapToWeekDayEnum = (day) => {
  switch (day.toUpperCase()) {
    case '0':
      return ScriptApp.WeekDay.SUNDAY;
    case '1':
      return ScriptApp.WeekDay.MONDAY;
    case '2':
      return ScriptApp.WeekDay.TUESDAY;
    case '3':
      return ScriptApp.WeekDay.WEDNESDAY;
    case '4':
      return ScriptApp.WeekDay.THURSDAY;
    case '5':
      return ScriptApp.WeekDay.FRIDAY;
    case '6':
      return ScriptApp.WeekDay.SATURDAY;
    default:
      throw new Error(`Invalid day provided: ${day}`);
  }
};

/**
 * Helper function to determine if a given date is the nth occurrence of a weekday in its month.
 * @param {Date} date
 * @param {string} frequency - e.g., 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'LAST'
 * @param {string} weekday - e.g., 'MONDAY'
 * @returns {boolean}
 */
function isNthWeekdayOfMonth(date, frequency, weekday) {
  const weekdays = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const desiredWeekday = weekdays[weekday.toUpperCase()];
  if (date.getDay() !== desiredWeekday) return false;

  const day = date.getDate();
  const occurrence = Math.floor((day - 1) / 7) + 1;
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  if (frequency.toUpperCase() === 'LAST') {
    return day + 7 > lastDay;
  }
  const freqMap = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3,
    FOURTH: 4,
  };
  return occurrence === freqMap[frequency.toUpperCase()];
}

/**
 * Retrieve schedule data from PropertiesService.
 * @returns {Object} scheduleData
 */
function getScheduleData() {
  const scheduleDataJSON =
    PropertiesService.getScriptProperties().getProperty('scheduleData');
  return JSON.parse(scheduleDataJSON);
}

function deleteExistingTriggers(fnNames) {
  const allTriggers = ScriptApp.getProjectTriggers();
  allTriggers.forEach((trigger) => {
    const handlerFunction = trigger.getHandlerFunction();
    if (fnNames.indexOf(handlerFunction) !== -1) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
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
      if (!skipCache) {
        cache.putBlob(link, blob);
      }
      return blob;
    }
    return ref;
  });
}

// Inserts an image from a given link, adn return the status code
function addImage(link) {
  const currentPage = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const slide = currentPage.asSlide();
  const blobs = getImages([link]);
  if (blobs[0].errorCode) {
    return blobs[0].errorCode;
  }
  const img = slide.insertImage(blobs[0]);
  img.setLinkUrl(link);
  return 200;
}

function preCacheImage(link) {
  const blobs = getImages([link]);
  return blobs[0];
}

/**
 * Reloads images by replacing them with new blobs.
 * @param {Image[]} images - An array of Image objects to reload.
 * @returns {Object} - An object containing arrays of error images and success images.
 */
function reloadImages(images) {
  const errorImages = [];
  const successImages = [];
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
      successImages.push(image.getLink().getUrl());
    } catch (e) {
      errorImages.push({
        link: image.getLink().getUrl(),
        errorCode: blob?.errorCode,
      });
    }
  });
  return { errorImages, successImages };
}

/**
 * Reloads the images in the current slide.
 */
function reloadImagesInCurrentSlide() {
  const currentPage = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const slide = currentPage.asSlide();

  const images = slide.getImages();
  const { errorImages, successImages } = reloadImages(images);
  if (errorImages.length === 0) {
    const shapes = slide.getShapes();
    shapes.forEach((shape) => {
      if (
        shape.getText() &&
        shape.getText().asString().indexOf('Last updated:') !== -1
      ) {
        shape.remove();
      }
    });

    const timestamp = new Date().toLocaleString();
    slide.insertTextBox(`Last updated: ${timestamp}`, 250, 400, 2000, 10);
  }

  return { errorImages, successImages };
}

/**
 * Reloads the images in the presentation.
 * Retrieves all slides in the active presentation, collects all images from each slide,
 * and reloads the images.
 */
function reloadImagesInPresentation() {
  const slides = SlidesApp.getActivePresentation().getSlides();

  console.log(slides, slides.length, typeof slides);
  const slideImages = slides.reduce((imgs, slide) => {
    const images = slide.getImages();
    return imgs.concat(images);
  }, []);
  const { errorImages, successImages } = reloadImages(slideImages);
  if (errorImages.length === 0) {
    slides.forEach((slide) => {
      var shapes = slide.getShapes();
      shapes.forEach((shape) => {
        if (
          shape.getText() &&
          shape.getText().asString().indexOf('Last updated:') !== -1
        ) {
          shape.remove();
        }
      });
      const timestamp = new Date().toLocaleString();
      slide.insertTextBox(`Last updated: ${timestamp}`, 250, 400, 2000, 10);
    });
  }

  return { errorImages, successImages };
}

/**
 * Function to check if today is the desired nth weekday and reload images.
 */
function checkAndReloadImages() {
  const scheduleData = getScheduleData();
  const { monthlyFrequency, dayOfWeek, timezone } = scheduleData;

  const today = new Date();
  const userTime = Utilities.formatDate(today, timezone, 'yyyy-MM-dd');
  const date = new Date(userTime);

  if (isNthWeekdayOfMonth(date, monthlyFrequency, dayOfWeek)) {
    reloadImagesInPresentation();
  }
}

function triggerWeeklyReloadImages() {
  const scheduleData = getScheduleData();
  const { daysOfWeek, timezone } = scheduleData;
  const today = Utilities.formatDate(new Date(), timezone, 'u');
  if (daysOfWeek.indexOf(today) !== -1) {
    reloadImagesInPresentation();
  }
}

// function to trigger monthly schedule based on dates
function triggerMonthlyReloadImages() {
  const scheduleData = getScheduleData();
  const { specificDate, timezone } = scheduleData;
  const today = parseInt(Utilities.formatDate(new Date(), timezone, 'd'), 10);
  const dates = specificDate.split(',').map(Number);
  if (dates.indexOf(today) !== -1) {
    reloadImagesInPresentation();
  }
}

function scheduleReloadImages(scheduleData) {
  PropertiesService.getScriptProperties().setProperty(
    'scheduleData',
    JSON.stringify(scheduleData)
  );

  deleteExistingTriggers([
    'reloadImagesInPresentation',
    'checkAndReloadImages',
    'triggerMonthlyReloadImages',
    'triggerWeeklyReloadImages',
  ]);

  const {
    frequency,
    time,
    timezone,
    daysOfWeek,
    monthlyOption,
    monthlyFrequency,
    dayOfWeek,
    specificDate,
  } = scheduleData;
  const [hour, minute] = time.split(':').map(Number);

  switch (frequency) {
    case 'Day':
      ScriptApp.newTrigger('reloadImagesInPresentation')
        .timeBased()
        .atHour(hour)
        .everyDays(1)
        .nearMinute(1)
        .inTimezone(timezone)
        .create();
      break;

    case 'Week':
      ScriptApp.newTrigger('triggerWeeklyReloadImages')
        .timeBased()
        .everyDays(1)
        .atHour(hour)
        .nearMinute(1)
        .inTimezone(timezone)
        .create();
      break;

    case 'Month':
      if (monthlyOption === 'By date') {
        ScriptApp.newTrigger('triggerMonthlyReloadImages')
          .timeBased()
          .everyDays(1)
          .atHour(hour)
          .nearMinute(1)
          .inTimezone(timezone)
          .create();
      } else if (monthlyOption === 'On the') {
        ScriptApp.newTrigger('checkAndReloadImages')
          .timeBased()
          .everyDays(1)
          .atHour(hour)
          .nearMinute(1)
          .inTimezone(timezone)
          .create();
      }
      break;

    default:
      console.error('Unexpected frequency value');
  }
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
