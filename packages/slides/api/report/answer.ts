import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnswerBlob } from '../../src/ui/services/report';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  console.log('API query', query);
  const cookies = request.headers.get('cookie');
  let answerBlobResp;
  try {
    answerBlobResp = await getAnswerBlob(query);
    console.log('Blob received');
  } catch (e) {
    console.log('Blob Failed', e);
    answerBlobResp = {
      body: e,
      status: e?.status,
      statusText: e?.statusText,
    };
  }

  return new Response(answerBlobResp?.body, {
    status: answerBlobResp?.status,
    statusText: answerBlobResp?.statusText,
  });
}
