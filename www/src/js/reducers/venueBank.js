// @flow
import type { FSA } from 'types/redux';
import type { VenueList } from 'types/venues';

import { FETCH_VENUE_LIST } from 'actions/venueBank';
import * as RequestResultCases from 'middlewares/requests-middleware';

export type VenueBank = {
  +venueList: VenueList,
};

const defaultModuleBankState: VenueBank = {
  venueList: [], // List of venue strings
};

function venueBank(state: VenueBank = defaultModuleBankState, action: FSA): VenueBank {
  switch (action.type) {
    case FETCH_VENUE_LIST + RequestResultCases.SUCCESS:
      return {
        ...state,
        venueList: action.payload,
      };

    default:
      return state;
  }
}

export default venueBank;

export const persistConfig = {
  throttle: 1000,
};
