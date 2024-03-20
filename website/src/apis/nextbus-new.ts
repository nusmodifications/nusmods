const baseURL = 'https://nusmods.com'; // TODO: wait until we have an api proxy

export const getStopTimings = async (
  stop: string,
  setState: (state: ShuttleServiceResult) => void,
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
    setState(data.ShuttleServiceResult);
  } catch (e) {
    console.error(e);
  }
};
