// @flow
import type { FSA } from 'types/redux';

import { API_REQUEST } from 'middlewares/requests-middleware';
import NUSModsApi from 'apis/nusmods';
import config from 'config';

export const FETCH_VENUE_LIST: string = 'FETCH_VENUE_LIST';
export function fetchVenueList(): FSA {
  return {
    type: FETCH_VENUE_LIST,
    payload: {
      method: 'GET',
      url: NUSModsApi.venueListUrl(config.semester),
    },
    meta: {
      [API_REQUEST]: FETCH_VENUE_LIST,
    },
  };
}
