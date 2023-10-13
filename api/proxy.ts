import { fetchEndpoint } from '../services/proxy';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const requestBody = await request.json();
  const payload = JSON.stringify({
    metadata_identifier: requestBody.answerId,
    file_format: 'PNG',
  });
  let res;
  //For logging in Axiom
  console.log('Proxy request body',requestBody);
  try {
    res = await fetchEndpoint(
      requestBody.endpoint,
      requestBody.clusterUrl,
      requestBody.token,
      requestBody.payload
    );
    console.log('Proxy res received', res?.status, res?.statusText);
  } catch (e) {
    console.log('Proxy res Failed', e);
    res = {
      body: e,
      status: e?.status,
      statusText: e?.statusText,
    };
  }

  return new Response(res?.body, {
    status: res?.status,
    statusText: res?.statusText,
  });
}
