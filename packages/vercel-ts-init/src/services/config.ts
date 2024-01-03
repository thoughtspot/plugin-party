export const getConfig = async (url) => {
  const res = await fetch(`https://${url}/callosum/v1/system/config`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
    credentials: 'include',
  });
  const data = await res.json();
  return data;
};
