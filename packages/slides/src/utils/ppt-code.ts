/**
 * @OnlyCurrentDoc
 */
/* eslint no-var: 0 */

import { enqueue } from '../services/QueueService';

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
        // we are resolving even if the save fails as we do not
        // want to block user from getting logged in
        reject(asyncResult.error);
        console.error('Failed to save settings:', asyncResult.error);
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

  console.log('linksToFetch', linksToFetch.length, linksToFetch);
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
 * Adds a TS_IMAGE_LINK tag to recently added images on the current slide
 * @param {string[]} links - Array of image URLs to tag
 */
async function addTagOnImage(links: string[]) {
  try {
    await PowerPoint.run(async (context) => {
      const slide = context.presentation.getSelectedSlides().getItemAt(0);
      slide.load('id');
      const shapes = slide.shapes;
      shapes.load('items');
      await context.sync();

      const totalShapes = shapes.items.length;
      const totalLinks = links.length;

      if (totalShapes < totalLinks) {
        throw new Error(
          'Not enough shapes found for the number of links provided'
        );
      }

      // Tag the most recently added shapes with their corresponding links
      for (let currentLink = 0; currentLink < totalLinks; currentLink++) {
        const shapeIndex = totalShapes - totalLinks + currentLink;
        const shape = shapes.items[shapeIndex];
        if (!shape) {
          throw new Error(`Shape at index ${shapeIndex} not found`);
        }
        shape.tags.add('TS_IMAGE_LINK', links[currentLink]);
      }

      await context.sync();
      console.log('Tags added to images successfully');
    });
  } catch (error) {
    console.error(
      'Failed to add tags to images, please try inserting the image again. error:',
      error
    );
    throw error;
  }
}

/**
 * Helper function to insert an image into the current slide
 * @param {string} imageData - Base64 encoded image data
 */
function insertImageIntoSlide(imageData: string): Promise<any> {
  return new Promise((resolve, reject) => {
    Office.context.document.setSelectedDataAsync(
      imageData,
      {
        coercionType: Office.CoercionType.Image,
        imageLeft: 100,
        imageTop: 100,
        imageHeight: 300,
        imageWidth: 400,
      },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(JSON.stringify(asyncResult)));
        } else {
          resolve(asyncResult);
        }
      }
    );
  });
}

/**
 * Helper function to load tags for image shapes
 */
async function loadImageTags(shapes: any[], context: any): Promise<void> {
  shapes.forEach((shape) => {
    if (shape.type === PowerPoint.ShapeType.image) {
      shape.tags.load('items');
    }
  });
  await context.sync();
}

/**
 * Helper function to replace an image while maintaining its position and size
 */
function replaceImage(
  shape: any,
  newImageData: string,
  successImages,
  errorImages
): Promise<any> {
  const oldLeft = shape.left;
  const oldTop = shape.top;
  const oldWidth = shape.width;
  const oldHeight = shape.height;

  shape.delete();

  return new Promise((resolve, reject) => {
    Office.context.document.setSelectedDataAsync(
      newImageData,
      {
        coercionType: Office.CoercionType.Image,
        imageLeft: oldLeft,
        imageTop: oldTop,
        imageWidth: oldWidth,
        imageHeight: oldHeight,
      },
      async (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(JSON.stringify(asyncResult)));
          errorImages.push({ shape, errorCode: asyncResult.error.code });
        } else {
          try {
            resolve(asyncResult);
            successImages.push(shape);
          } catch (error) {
            reject(error);
          }
        }
      }
    );
  });
}

/**
 * Adds an image to the current slide.
 * @param {string} link - The image URL.
 * @returns {Promise<number>} - HTTP status code (200 for success, error code otherwise).
 */
export async function addImage(link: string): Promise<number> {
  try {
    // Get base64 encoded image data
    const base64Images = await getImages([link]);
    if (base64Images[0].errorCode) {
      return base64Images[0].errorCode;
    }

    // Insert the image into the PowerPoint slide
    await insertImageIntoSlide(base64Images[0]);

    await addTagOnImage([link]);

    return 200;
  } catch (error) {
    console.error('Error adding image:', error);
    return 500;
  }
}

/**
 * Queues an image insertion operation to ensure that image insertions are executed sequentially.
 *
 * Office.js operations (such as inserting images and tagging them) must run sequentially,
 * because overlapping calls (e.g., multiple PowerPoint.run calls) can lead to race conditions
 * and unexpected behavior. By enqueuing operations, each image insertion waits for the previous
 * one to complete before starting.
 *
 * @param {string} link - The image URL to insert.
 * @returns {Promise<number>} A promise that resolves with the response code from the addImage function.
 */
export function addImageQueued(link: string): Promise<number> {
  return enqueue(() => addImage(link));
}

/**
 * Reloads all tagged images in the current slide with fresh data from their source URLs.
 * Images must have a 'TS_IMAGE_LINK' tag containing the source URL to be reloaded.
 */
export async function reloadImagesInCurrentSlide() {
  const successImages = [];
  const errorImages = [];

  await PowerPoint.run(async (context) => {
    // Get the currently selected slide
    const selectedSlides = context.presentation.getSelectedSlides();
    selectedSlides.load('items');
    await context.sync();

    if (selectedSlides.items.length === 0) {
      console.log('No slides are currently selected.');
      return;
    }

    // Load all shapes from the current slide
    const currentSlide = selectedSlides.items[0];
    currentSlide.load('shapes');
    await context.sync();

    const shapes = currentSlide.shapes.items;
    await context.sync();

    // Load tags for all shapes
    await loadImageTags(shapes, context);

    // Get the TS_IMAGE_LINK tag value for each shape
    const tsImageLinkTag: PowerPoint.Tag[] = [];
    shapes.forEach((shape, id) => {
      tsImageLinkTag.push(shape.tags.getItemOrNullObject('TS_IMAGE_LINK'));
      tsImageLinkTag[id].load('key, value');
    });
    await context.sync();

    // Create array of shapes with their corresponding image link tags
    const imagesWithTag = await Promise.all(
      shapes.map(async (shape, idx) => {
        return { shape, tsImageLink: tsImageLinkTag[idx].value };
      })
    );

    // Filter out shapes without tags
    const imagesToReplace = imagesWithTag.filter(
      (image) => image.tsImageLink !== null && image.tsImageLink !== undefined
    );

    // Get fresh image data for all tagged images
    const imageLinks = imagesToReplace.map((image) => image.tsImageLink);
    const base64Images = await getImages(imageLinks);

    // Replace each image with new image
    const promises = imagesToReplace.map((image, index) =>
      replaceImage(image.shape, base64Images[index], successImages, errorImages)
    );

    await context.sync();
    await Promise.all(promises);

    // Reapply tags to the new images
    await addTagOnImage(imageLinks);
    console.log('Successfully replaced images with TS_IMAGE_LINK.');
  });

  return { errorImages, successImages };
}

/**
 * Reloads all tagged images across all slides with fresh data from their source URLs.
 * Images must have a 'TS_IMAGE_LINK' tag containing the source URL to be reloaded.
 */
export async function reloadImagesInPresentation() {
  const errorImages = [];
  const successImages = [];

  await PowerPoint.run(async (context) => {
    // Load all slides in the presentation
    const slides = context.presentation.slides;
    slides.load('items');
    await context.sync();

    // Map of slide IDs to arrays of image links
    const slideImageLinks = await slides.items.reduce(async (acc, slide) => {
      const links = await acc;
      slide.load('shapes');
      await context.sync();

      // Load shapes and their tags for the current slide
      const shapes = slide.shapes.items;
      await loadImageTags(shapes, context);

      // Get TS_IMAGE_LINK tags for all shapes
      const tags = shapes.map((shape) => {
        const tag = shape.tags.getItemOrNullObject('TS_IMAGE_LINK');
        tag.load('value');
        return tag;
      });
      await context.sync();

      // Store valid image links for this slide
      links[slide.id] = tags
        .filter((tag) => !tag.isNullObject)
        .map((tag) => tag.value);
      return links;
    }, Promise.resolve({} as { [key: string]: string[] }));

    // Get new image for all tagged images across all slides
    const allImageLinks = Object.values(slideImageLinks).flat();
    const allBase64Images = await getImages(allImageLinks);

    const base64ImagesMap = Object.fromEntries(
      allImageLinks.map((imageLink, idx) => [imageLink, allBase64Images[idx]])
    );

    // Process each slide sequentially
    await slides.items.reduce(async (promise, slide) => {
      await promise;
      // Select the current slide to work with
      context.presentation.setSelectedSlides([slide.id]);
      await context.sync();

      const shapes = slide.shapes.items;
      const slideLinks = slideImageLinks[slide.id];

      if (slideLinks.length > 0) {
        // Process each shape in the slide sequentially
        await shapes.reduce(async (p, shape, shapeIndex) => {
          await p;

          // Check if this shape has a TS_IMAGE_LINK tag
          const tag = shape.tags.getItemOrNullObject('TS_IMAGE_LINK');
          tag.load('value');
          await context.sync();
          if (!tag.isNullObject) {
            await replaceImage(
              shape,
              base64ImagesMap[tag.value],
              successImages,
              errorImages
            );
          }
        }, Promise.resolve());

        // Reapply tags to the new images
        await addTagOnImage(slideLinks);
      }
    }, Promise.resolve());
  });

  return { successImages, errorImages };
}
