import { getInitConfig } from '@thoughtspot/visual-embed-sdk';
import { useState } from 'preact/hooks';
import {
  errorMessages,
  getParsedListData,
  listCategory,
  listInput,
  listType,
} from './services.util';

let currentListFetch: any = null;

export const getList = async ({
  type,
  category,
  pattern,
  recordOffset,
  ids,
}: listInput) => {
  const baseUrl = getInitConfig().thoughtSpotHost;

  const includeFavorite = {
    [listCategory.FAVORITES]: true,
    [listCategory.ALL]: false,
    [listCategory.YOURS]: false,
  };

  const userID = {
    [listCategory.FAVORITES]: [],
    [listCategory.ALL]: [],
    [listCategory.YOURS]: ids,
  };

  const controller = new AbortController();
  const signal = controller.signal;

  if (currentListFetch) {
    currentListFetch.controller.abort();
  }

  const fetchList = fetch(`${baseUrl}/callosum/v1/v2/metadata/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      metadata: `[{"type":"${type}", "name_pattern":"${pattern || ''}"}]`,
      favorite_object_options: `{"include": ${
        includeFavorite[category] || false
      }}`,
      created_by_user_identifiers: JSON.stringify(userID[category] || []),
      record_offset: `${recordOffset || 0}`,
      record_size: '10',
      include_headers: 'false',
      include_details: 'true',
      include_stats: 'true',
      sort_options: '{"field_name":"MODIFIED","order":"DESC"}',
    }).toString(),
    credentials: 'include',
    signal,
  });
  currentListFetch = {
    controller,
    promise: fetchList,
  };
  const itemList = await fetchList
    .then((res) => res.json())
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
      const { data: items } = await getList({
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

      const parsedListData = getParsedListData(items);
      if (offset > 0) {
        setData([...data, ...parsedListData]);
      } else {
        setData(parsedListData);
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
