import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLiveboardBlob } from '../../src/ui/services/report';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  console.log('API query', query);
  let liveboardBlobRes;
  try {
    liveboardBlobRes = await getLiveboardBlob(query);
    console.log('Blob received');
  } catch (e) {
    console.log('Blob Failed', e);
    liveboardBlobRes = {
      body: e,
      status: e?.status,
      statusText: e?.statusText,
    };
  }

  return new Response(liveboardBlobRes?.body, {
    status: liveboardBlobRes?.status,
    statusText: liveboardBlobRes?.statusText,
  });
}
