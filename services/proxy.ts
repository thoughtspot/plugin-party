export async function fetchEndpoint(endpoint, clusterUrl, token, payload) {
  const fetchReq = {
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };
  const url = `https://${clusterUrl}/${endpoint}`;
  const fetchedData = await fetch(url, fetchReq);
  return fetchedData;
}
