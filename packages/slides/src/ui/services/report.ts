export async function getAnswerBlob(payload) {
  const fetchReq = {
    method: 'post',
    headers: {
      Authorization: `Bearer ${payload.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metadata_identifier: payload.answerId,
      file_format: 'PNG',
    }),
  };
  const url = `https://${payload.url}/api/rest/2.0/report/answer`;
  const answerBlob = await fetch(url, fetchReq);
  return answerBlob;
}
export async function getLiveboardBlob(payload) {
  const fetchReq = {
    method: 'post',
    headers: {
      Authorization: `Bearer ${payload.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metadata_identifier: payload.liveboardId,
      visualization_identifiers: [payload.vizId],
      file_format: 'PNG',
    }),
  };
  const url = `https://${payload.url}/api/rest/2.0/report/liveboard`;
  const liveboardBlob = await fetch(url, fetchReq);
  return liveboardBlob;
}
