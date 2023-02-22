import { getInitConfig } from '@thoughtspot/visual-embed-sdk';

export const getQueryResult = async (query: string, sourceName: string) => {
  const baseUrl = getInitConfig().thoughtSpotHost;
  const r = await fetch(`${baseUrl}/api/rest/2.0/searchdata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query_string: query,
      logical_table_identifier: sourceName,
      data_format: 'COMPACT',
      record_size: 1000000,
    }),
    credentials: 'include',
  });
  const data = await r.json();
  return {
    colNames: data.contents[0].column_names,
    rows: data.contents[0].data_rows,
  };
};
