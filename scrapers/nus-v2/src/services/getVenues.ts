import _ from 'lodash';
import axios from 'axios';

import { VenueLocationMap } from '../types/venues';

const VENUES_URL =
  'https://raw.githubusercontent.com/nusmodifications/nusmods/master/website/src/data/venues.json';

const getVenues = _.memoize(async () => {
  const response = await axios.get<VenueLocationMap>(VENUES_URL);
  return response.data;
});
