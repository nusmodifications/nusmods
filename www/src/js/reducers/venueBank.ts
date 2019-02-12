import { FSA } from 'types/redux';
import { VenueList } from 'types/venues';

import { FETCH_VENUE_LIST } from 'actions/venueBank';
import { SUCCESS } from 'types/reducers';

export type VenueBank = {
  readonly venueList: VenueList;
};

const defaultModuleBankState: VenueBank = {
  venueList: [], // List of venue strings
};

function venueBank(state: VenueBank = defaultModuleBankState, action: FSA): VenueBank {
  switch (action.type) {
    case FETCH_VENUE_LIST + SUCCESS:
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
