import { getInitConfig } from '@thoughtspot/visual-embed-sdk';
import _ from 'lodash';

export const getUserInfo = async () => {
  const baseUrl = getInitConfig().thoughtSpotHost;
  const r = await fetch(`${baseUrl}/api/rest/2.0/auth/session/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const data = await r.json();
  return {
    data,
  };
};

export const getTSObjectList = async () => {
  const baseUrl = getInitConfig().thoughtSpotHost;
  const res = await fetch(`${baseUrl}/api/rest/2.0/metadata/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metadata: [
        {
          type: 'LIVEBOARD',
        },
        {
          type: 'ANSWER',
        },
      ],
      record_size: 10,
    }),
    credentials: 'include',
  });
  const data = await res.json();
  const groupedData = _.groupBy(data, 'metadata_type');
  return {
    liveboardList: groupedData.LIVEBOARD,
    answerList: groupedData.ANSWER,
  };
};
