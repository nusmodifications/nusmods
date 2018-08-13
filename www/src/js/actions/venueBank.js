// @flow
import type { FSA } from 'types/redux';

import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';
import config from 'config';

export const FETCH_VENUE_LIST: string = 'FETCH_VENUE_LIST';
export function fetchVenueList(): FSA {
  return requestAction(FETCH_VENUE_LIST, {
    url: NUSModsApi.venueListUrl(config.semester),
  });
}
