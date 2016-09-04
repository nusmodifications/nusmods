import { API_REQUEST } from 'middlewares/requests-middleware';

export const FETCH_REDDITS = 'FETCH_REDDITS';
export function fetchReddits(topic) {
  return (dispatch) => dispatch({
    [API_REQUEST]: {
      type: FETCH_REDDITS,
      payload: {
        method: 'GET',
        url: `https://www.reddit.com/r/${topic}.json`,
      },
    },
  });
}
