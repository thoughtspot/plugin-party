export const formatClusterUrl = (url: string) => {
  let formattedURL = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    formattedURL = `https://${url}`;
  }
  return new URL(formattedURL).origin;
};
