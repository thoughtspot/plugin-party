import { getInitConfig } from '@thoughtspot/visual-embed-sdk';
import _ from 'lodash';
import { useEffect, useState } from 'preact/compat';

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
    id: data.id,
    name: data.name,
  };
};

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result: string = reader.result as string;
      const base64data = result.substring(result.indexOf(',') + 1);
      resolve(base64data);
    };
    reader.readAsDataURL(blob);
  });
}

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

export const exportAnswer = async (answerId) => {
  const baseUrl = getInitConfig().thoughtSpotHost;
  const res = await fetch(`${baseUrl}/api/rest/2.0/report/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metadata_identifier: answerId,
      file_format: 'PNG',
    }),
    credentials: 'include',
  });
  const blob = await res.blob();
  return blobToBase64(blob);
};

export const getToken = async () => {
  const baseUrl = getInitConfig().thoughtSpotHost;
  const res = await fetch(`${baseUrl}/callosum/v1/session/v2/gettoken`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
    credentials: 'include',
  });
  const data = await res.json();
  return {
    token: data.token,
    ttl: (data.tokenExpiryDuration - data.tokenCreatedTime) / 1000,
  };
};

export const useGetUserInfo = () => {
  const [data, setData] = useState<any>();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      const info = await getUserInfo();
      setData(info);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);
  return { data, error, loading };
};
