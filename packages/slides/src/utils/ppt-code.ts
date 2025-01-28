/**
 * @OnlyCurrentDoc
 */
/* eslint no-var: 0 */

/**
 * Converts an ArrayBuffer to a Base64 string.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function getOfficeSettings() {
  return Office?.context?.document?.settings;
}

function saveAsync() {
  return new Promise((resolve, reject) => {
    // Check if Office context and settings are available
    if (!Office?.context?.document?.settings) {
      reject(new Error('Office settings API is not available'));
      return;
    }

    Office.context.document.settings.saveAsync(function (asyncResult) {
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        resolve(asyncResult);
      } else {
        reject(
          new Error(`Failed to save settings: ${asyncResult.error?.message}`)
        );
      }
    });
  });
}

export async function setToken(token, ttl) {
  getOfficeSettings().set('ts-auth-token', token);
  await saveAsync();
}

export function getAuthToken() {
  return getOfficeSettings().get('ts-auth-token');
}

export async function setClusterUrlInPowerpoint(url) {
  getOfficeSettings().set('cluster-url', url);
  await saveAsync();
}

export function getClusterUrl() {
  if (getOfficeSettings().get('cluster-url')) {
    return {
      url: getOfficeSettings().get('cluster-url'),
      isCandidate: false,
      isError: false,
    };
  }
  // Ideally we should fetch the email of the user
  // and using that we should return a candidate url
  // need to check if we can fetch the user email somehow
  return {
    url: 'embed-1-do-not-delete.thoughtspotstaging.cloud',
    isCandidate: true,
    isError: false,
  };
}

/**
 * Retrieves the request object for generating a liveboard image.
 * @param liveboardId - The identifier of the liveboard.
 * @param vizId - The identifier of the visualization.
 * @returns The request object.
 */
function getLiveboardImageRequest({ liveboardId, vizId, personalisedViewId }) {
  const token = getAuthToken();
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
  return {
    method: 'POST',
    muteHttpExceptions: true,
    body: JSON.stringify(liveboardReportPayload),
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
}

/**
 * Creates a fetch request for an answer image.
 * @param {string} answerId - The answer ID.
 * @returns {RequestInit} - Fetch request options.
 */
function getAnswerImageRequest(answerId) {
  const token = getAuthToken();
  const answerReportPayload = {
    metadata_identifier: answerId,
    file_format: 'PNG',
  };
  return {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(answerReportPayload),
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
 * Retrieves images from URLs.
 * @param {string[]} links - Array of image URLs.
 * @returns {Promise<(Blob | { errorCode: number })[]>}
 */
async function getImagesRaw(links) {
  const clusterUrl = getClusterUrl().url;
  const metadatas = links.map(getImageMetadata);
  const fetchRequests = metadatas.map((metadata) => {
    if (metadata.type === 'ANSWER') {
      return {
        url: `https://${clusterUrl}/api/rest/2.0/report/answer`,
        options: getAnswerImageRequest(metadata.id),
      };
    }
    if (metadata.type === 'LIVEBOARD') {
      return {
        url: `https://${clusterUrl}/api/rest/2.0/report/liveboard`,
        options: getLiveboardImageRequest({
          liveboardId: metadata.id,
          vizId: metadata.vizId,
          personalisedViewId: metadata.personalisedViewId,
        }),
      };
    }
    return null;
  });

  const responses = await Promise.all(
    fetchRequests.map(({ url, options }) => fetch(url, options))
  );

  // Use Promise.all to resolve all Base64 conversions
  const base64Res = await Promise.all(
    responses.map(async (response) => {
      if (response.status !== 200) {
        return { errorCode: response.status };
      }
      const arrayBuffer = await response.arrayBuffer();
      const base64String = arrayBufferToBase64(arrayBuffer);
      return base64String;
    })
  );

  return base64Res;
}

/**
 * Retrieves images from the given links with caching.
 * @param {string[]} links - Array of image URLs.
 * @param {boolean} skipCache - Whether to skip cache.
 * @returns {Promise<(Blob | { errorCode: number })[]>}
 */
async function getImages(links, skipCache = true) {
  const cache = new Map();
  const linksToFetch = [];
  const linkToFetchHash = {};

  const linkRefs = links.map((link) => {
    if (!skipCache && cache.has(link)) {
      console.log('cache hit', link);
      return [link, cache.get(link)];
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
  const blobs = await getImagesRaw(linksToFetch);
  return linkRefs.map((linkRef) => {
    const link = linkRef[0];
    const ref = linkRef[1];
    if (typeof ref === 'number') {
      const blob = blobs[ref];
      if (!skipCache && blob instanceof Blob) {
        cache.set(link, blob);
      }
      return blob;
    }
    return ref;
  });
}

/**
 * Adds an image to the current slide.
 * @param {string} link - The image URL.
 * @returns {Promise<number>} - HTTP status code.
 */
export async function addImage(link: string) {
  try {
    const base64Images = await getImages([link]);
    if (base64Images[0].errorCode) {
      return base64Images[0].errorCode;
    }
    await new Promise((resolve, reject) => {
      Office.context.document.setSelectedDataAsync(
        base64Images[0],
        { coercionType: Office.CoercionType.Image },
        (asyncResult) => {
          if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(JSON.stringify(asyncResult)));
          } else {
            resolve(asyncResult);
          }
        }
      );
    });

    return 200;
  } catch (error) {
    console.error('Error adding image:', error);
    return 500;
  }
}
