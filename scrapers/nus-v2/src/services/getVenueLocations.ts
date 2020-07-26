import _ from 'lodash';
import axios from 'axios';

import { VenueLocationMap } from '../types/venues';
import { retry } from '../utils/api';

const VENUES_URL =
  'https://raw.githubusercontent.com/nusmodifications/nusmods/master/website/src/data/venues.json';

// Explicitly typed so it excludes MemoizedFunction typing for easier mocking
const getVenueLocations: () => Promise<VenueLocationMap> = _.memoize(async () => {
  const response = await retry(() => axios.get<VenueLocationMap>(VENUES_URL), 3);
  return response.data;
});

export default getVenueLocations;
