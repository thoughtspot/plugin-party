import { getInitConfig } from '@thoughtspot/visual-embed-sdk';
import { useState } from 'preact/hooks';
import {
  errorMessages,
  getStructuredData,
  listCategory,
  listInput,
  listType,
} from './services.util';

let currentListFetch: any = null;
const listTypeMap = {
  [listType.ANSWER]: 'QUESTION_ANSWER_BOOK',
  [listType.LIVEBOARD]: 'PINBOARD_ANSWER_BOOK',
};

const categoryMap = {
  [listCategory.FAVORITES]: 'FAVORITE',
  [listCategory.ALL]: 'ALL',
  [listCategory.YOURS]: 'MY',
};

export const fetchSparseDetails = async (type: string, idsArray: []) => {
  const baseUrl = getInitConfig().thoughtSpotHost;
  const fecthDetails = fetch(
    `${baseUrl}/callosum/v1/metadata/sparsedetails?type=${
      listTypeMap[type]
    }&ids=${encodeURIComponent(JSON.stringify(idsArray))}`,
    {
      method: 'get',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );
  const itemDetails = await fecthDetails.then((res) => res.json());
  return itemDetails;
};

export const getList = async ({
  type,
  category,
  pattern,
  recordOffset,
}: listInput) => {
  const baseUrl = getInitConfig().thoughtSpotHost;

  const controller = new AbortController();
  const signal = controller.signal;

  if (currentListFetch) {
    currentListFetch.controller.abort();
  }

  const fetchList = fetch(
    `${baseUrl}/callosum/v1/metadata/list?type=${listTypeMap[type]}&category=${categoryMap[category]}&sort=MODIFIED&sortascending=false&offset=${recordOffset}&batchsize=10&pattern=${pattern}&showhidden=false`,
    {
      method: 'get',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
      signal,
    }
  );
  currentListFetch = {
    controller,
    promise: fetchList,
  };
  const itemList = await fetchList
    .then(async (res) => {
      const response = await res.json();
      const pinboardHeaders = response?.headers;
      const ids = pinboardHeaders.map((h) => h.id);
      const details = await fetchSparseDetails(type, ids);
      const listItems = pinboardHeaders.map((header) => {
        return getStructuredData(header, details);
      });
      return listItems;
    })
    .catch((err) => {
      if (signal.aborted)
        throw new Error(errorMessages.REQUEST_CANCELLED_MESSAGE);
    });
  return itemList;
};

export function useMetadataSearch(userId: string) {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLastBatch, setLastBatch] = useState(false);

  async function fetchData(
    type: string,
    searchTerm: string,
    fetchCategory: any,
    offset = 0
  ) {
    setLoading(true);
    try {
      const items = await getList({
        type,
        category: fetchCategory,
        pattern: searchTerm,
        recordOffset: offset,
        ids: [userId],
      });

      if (items.length < 10) setLastBatch(true);
      else {
        setLastBatch(false);
      }

      const fectedListData = items;
      if (offset > 0) {
        setData([...data, ...fectedListData]);
      } else {
        setData(fectedListData);
      }
      setLoading(false);
    } catch (e) {
      if (e.message !== errorMessages.REQUEST_CANCELLED_MESSAGE)
        setLoading(false);
      setError(e);
    }
  }

  function resetData() {
    setData([]);
  }

  return {
    data,
    error,
    loading,
    refetchData: fetchData,
    resetData,
    isLastBatch,
  };
}
