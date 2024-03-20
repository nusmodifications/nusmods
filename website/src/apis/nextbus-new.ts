const baseURL = 'https://nusmods.com'; // TODO: wait until we have an api proxy

export const getStopTimings = async (
  stop: string,
  callback?: (data: any) => void,
  error?: (e: any) => void,
) => {
  if (!stop) return;
  const API_AUTH = ''; // TODO: wait until we have an api proxy
  try {
    const response = await fetch(`${baseURL}/ShuttleService?busstopname=${stop}`, {
      headers: {
        authorization: API_AUTH,
        accept: 'application/json',
      },
    });
    const data = await response.json();
    // console.log(data);
    if (callback) callback(data.ShuttleServiceResult);
  } catch (e) {
    // console.error(e);
    if (error) error(e);
  }
};
