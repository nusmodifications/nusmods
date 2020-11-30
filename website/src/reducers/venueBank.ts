import { FETCH_VENUE_LIST } from 'actions/venueBank';
import { VenueBank } from 'types/reducers';
import { Actions } from 'types/actions';
import { SUCCESS_KEY } from '../middlewares/requests-middleware';

const defaultModuleBankState: VenueBank = {
  venueList: [], // List of venue strings
};

function venueBank(state: VenueBank = defaultModuleBankState, action: Actions): VenueBank {
  switch (action.type) {
    case SUCCESS_KEY(FETCH_VENUE_LIST):
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
