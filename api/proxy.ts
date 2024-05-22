import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchEndpoint} from '../services/proxy';
import { readStreamResponse } from '../services/service-util';

export const maxDuration = 300;

export default async function (req: VercelRequest, res: VercelResponse) {
  console.log('vercel request', req?.body, req?.query);
  const requestBody = req?.body;
  let response: Response;
  //For logging in Axiom
  console.log(
    'Proxy request body',
    requestBody.endpoint,
    requestBody.clusterUrl,
    requestBody.token,
    requestBody.payload
  );
  try {
    response = await fetchEndpoint(
      requestBody.endpoint,
      requestBody.clusterUrl,
      requestBody.token,
      requestBody.payload
    );

    console.log(
      'Proxy res received',
      response?.status,
      response?.statusText
    );
    res.setHeader('Content-Type', response.headers.get('content-type'));
    if (response?.status != 200) {
      res.status(response?.status).end();
    } else if (response.headers.get('content-type') === 'application/octet-stream'){
      readStreamResponse(response, res);
    } else {
      res.send(response?.body);
      res.status(200).end()
    }
  } catch (error) {
    console.log('Proxy res Failed', error);
    throw new Error(error);
  }
}
