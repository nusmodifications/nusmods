import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';
import config from 'config';
import { RequestActions } from 'middlewares/requests-middleware';
import { VenueList } from 'types/venues';

export const FETCH_VENUE_LIST = 'FETCH_VENUE_LIST';
export function fetchVenueList() {
  return requestAction(FETCH_VENUE_LIST, {
    url: NUSModsApi.venueListUrl(config.semester),
  });
}

export type VenueActions = RequestActions<typeof FETCH_VENUE_LIST, VenueList>;
