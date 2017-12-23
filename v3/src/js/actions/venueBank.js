// @flow
import type { FSA } from 'types/redux';

import { API_REQUEST } from 'middlewares/requests-middleware';
import NUSModsApi from 'apis/nusmods';

export const FETCH_VENUE_LIST: string = 'FETCH_VENUE_LIST';
export function fetchModuleList(): FSA {
  return {
    type: FETCH_VENUE_LIST,
    payload: {
      method: 'GET',
      url: NUSModsApi.venueList(),
    },
    meta: {
      [API_REQUEST]: true,
    },
  };
}
