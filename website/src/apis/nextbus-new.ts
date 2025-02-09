const baseURL = 'https://nnextbus.nusmods.com'; // TODO: wait until we have an api proxy

export const getStopTimings = async (
  stop: string,
  callback?: (data: ShuttleServiceResult) => void,
  error?: (e: unknown) => void,
) => {
  if (!stop) return;
  // TODO: wait until we have an api proxy
  // const API_AUTH = '';
  try {
    const headers = {
      // headers: {
      //   authorization: API_AUTH,
      //   accept: 'application/json',
      // },
    };
    const response = await fetch(`${baseURL}/ShuttleService?busstopname=${stop}`, headers);
    const data = await response.json();
    // console.log(data);
    if (callback) callback(data.ShuttleServiceResult);
  } catch (e) {
    // console.error(e);
    if (error) error(e);
  }
};
