export const linksNotToShowLoader = ['callosum/v1/metadata'];

export const showLoaderOnFetch = (fetchLink) => {
  return !linksNotToShowLoader.some((link) => fetchLink.includes(link));
};
