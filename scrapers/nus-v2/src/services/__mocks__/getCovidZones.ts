/* eslint-disable import/no-duplicates */
import type getCovidZones from '../getCovidZones';
import type { CovidZones } from '../getCovidZones';
/* eslint-enable */

// Erm, so yeah the easiest way to mock this data is to just import the real thing from /website
import covidZones from '../../../../../website/src/data/covidZones.json';

const mockGetCovidZones: typeof getCovidZones = async () => covidZones as CovidZones;

export { getVenueCovidZone } from '../getCovidZones';
export default mockGetCovidZones;
