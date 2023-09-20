import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  userProperties,
  mockGoogleSesssion,
  mockCacheService,
  mockPropertiesService,
  mockGoogleFetch,
} from './googleservice.mocks';
import {
  getAnswerImageRequest,
  getCandidateClusterUrl,
  getImageMetadata,
  getImagesRaw,
  getLiveboardImageRequest,
  resetTSInstance,
  setClusterUrl,
  getClusterUrl,
  setToken,
} from '../../dist/Code';

const LIVEBOARD_LINK =
  'https://test.thoughtspotdev.cloud/#/pinboard/eb467552-2876-4ad7-905f-da6a09d7d4ba/2a55264e-2c6a-464f-af61-887991bd46e8';
const ANSWER_LINK =
  'https://test.thoughtspotdev.cloud/#/saved-answer/b13415a8-4515-4d12-97e8-55dc77302093';
const tsInstance = 'https://test.thoughtspotdev.cloud/#/';
const token = 'ZGVtb3VzZXIyOkpITm9hWEp2TVNSVFNFRXRNalUySkRVd01EQXdNQ1I1W';

const mockAnswerMetadata = {
  type: 'ANSWER',
  id: 'b13415a8-4515-4d12-97e8-55dc77302093',
};
const mockLiveboardMetadata = {
  type: 'LIVEBOARD',
  id: 'eb467552-2876-4ad7-905f-da6a09d7d4ba',
  vizId: '2a55264e-2c6a-464f-af61-887991bd46e8',
};

const mockAnswerImageRequests = (answerId, clusterUrl) => {
  const answerReportPayload = {
    metadata_identifier: answerId,
    file_format: 'PNG',
  };
  return {
    url: 'https://plugin-party-slides.vercel.app/api/proxy',
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      clusterUrl,
      endpoint: 'api/rest/2.0/report/answer',
      token,
      payload: answerReportPayload,
    }),
  };
};

const mockLiveboardImageRequests = (liveboardId, vizId, clusterUrl) => {
  const liveboardReportPayload = {
    metadata_identifier: liveboardId,
    visualization_identifiers: [vizId],
    file_format: 'PNG',
  };
  return {
    url: 'https://plugin-party-slides.vercel.app/api/proxy',
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      clusterUrl,
      endpoint: 'api/rest/2.0/report/liveboard',
      token,
      payload: liveboardReportPayload,
    }),
  };
};

function resetGlobals() {
  global.Session = undefined as any;
  global.CacheService = undefined as any;
  global.PropertiesService = undefined as any;
  global.UrlFetchApp = undefined as any;
}

describe('Candidate related functions', () => {
  beforeAll(() => {
    mockGoogleSesssion();
    mockCacheService();
    mockPropertiesService();
    mockGoogleFetch();
    setClusterUrl(tsInstance);
    setToken(token, 't');
  });

  afterAll(() => {
    resetGlobals();
  });

  it('Should Get cluster url from candidates email', () => {
    const url = getCandidateClusterUrl();
    expect(url).toBe('example.thoughtspot.cloud');
  });

  it('Should delete cluster url from user properties when reset is used', () => {
    resetTSInstance();
    expect(userProperties['ts-cluster-url']).toBe(undefined);
  });
});

describe('Image related Google script functions', () => {
  beforeAll(() => {
    mockGoogleSesssion();
    mockCacheService();
    mockPropertiesService();
    mockGoogleFetch();
    setClusterUrl(tsInstance);
    setToken(token, 't');
  });

  afterAll(() => {
    resetGlobals();
  });

  it('getImageMetadata should return correct object for type Answer', async () => {
    const answerMetadata = getImageMetadata(ANSWER_LINK);
    expect(answerMetadata).toStrictEqual(mockAnswerMetadata);
  });

  it('getImageMetadata should return correct object for type Liveboard', async () => {
    const liveboardMetadata = getImageMetadata(LIVEBOARD_LINK);
    expect(liveboardMetadata).toStrictEqual(mockLiveboardMetadata);
  });

  it('getImageMetadata should return correct object for type unknown', async () => {
    const unknownMetadata = getImageMetadata(tsInstance);
    expect(unknownMetadata).toStrictEqual({
      type: 'UNKNOWN',
    });
  });

  it('Should output desired image request for answer', async () => {
    const answerImageRequest = getAnswerImageRequest(mockAnswerMetadata.id);
    const clusterUrl = getClusterUrl().url;
    expect(answerImageRequest).toStrictEqual(
      mockAnswerImageRequests(mockAnswerMetadata.id, clusterUrl)
    );
  });

  it('Should output desired image request for liveboard', async () => {
    const liveboardImageRequest = getLiveboardImageRequest({
      liveboardId: mockLiveboardMetadata.id,
      vizId: mockLiveboardMetadata.vizId,
    });
    const clusterUrl = getClusterUrl().url;
    expect(liveboardImageRequest).toStrictEqual(
      mockLiveboardImageRequests(
        mockLiveboardMetadata.id,
        mockLiveboardMetadata.vizId,
        clusterUrl
      )
    );
  });

  it('Fetch images for given array of Lb and answer links in order', async () => {
    const fetchRequests = getImagesRaw([ANSWER_LINK, LIVEBOARD_LINK]);
    const clusterUrl = getClusterUrl().url;
    expect(fetchRequests).toStrictEqual([
      mockAnswerImageRequests(mockAnswerMetadata.id, clusterUrl),
      mockLiveboardImageRequests(
        mockLiveboardMetadata.id,
        mockLiveboardMetadata.vizId,
        clusterUrl
      ),
    ]);
  });

  it('If type of link is unknown fetch request should be null', async () => {
    const fetchRequests = getImagesRaw([tsInstance]);
    expect(fetchRequests).toStrictEqual([null]);
  });
});
