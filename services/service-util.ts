export const readStreamResponse = (response, vercelRes) => {
  const resReader = response.body.getReader();
  vercelRes.setHeader('Content-Type', 'application/octet-stream');
  resReader.read().then(function readStream(blobData) {
    if (blobData.value) {
      vercelRes.write(blobData.value);
    }
    if (blobData.done) {
      vercelRes.status(200).end();
      return;
    }
    return resReader.read().then(readStream);
  });
};
