const axios = require('axios');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const nusmods = require('../src/js/apis/nusmods');

const args = process.argv.slice(2);

const remoteSource =
  args[0] ||
  'https://raw.githubusercontent.com/taneliang/NUSVenues/master/results/finalVenues.json';
const localSource = args[1] || path.resolve(__dirname, '../src/js/data/venues.json');

(async () => {
  const [rawRemoteVenues, localVenues, apiVenues1, apiVenues2] = await Promise.all([
    axios.get(remoteSource).then((res) => res.data),
    fs.readJson(localSource).catch((err) => {
      // If this is the first time this script is run, we can ignore this error
      console.log(`Local venue data ${localSource} cannot be loaded`);
      console.log(err);
      console.log('Continuing using only remote data');
      return {};
    }),
    axios.get(nusmods.venueListUrl(1)).then((res) => res.data),
    axios.get(nusmods.venueListUrl(2)).then((res) => res.data),
  ]);

  // Merge and unique venues
  const apiVenues = _.uniq([...apiVenues1, ...apiVenues2]);

  // Transform remote data into the correct shape
  // - Delete unused keys (NUS room code, epsg3414 coordinates, etc.)
  // - Replace location with the wgs84 key
  const remoteVenues = {};
  rawRemoteVenues.forEach((venue) => {
    if (!venue.details || !apiVenues.includes(venue.corsRoomCode)) {
      return;
    }

    /* eslint-disable no-param-reassign */
    delete venue.details.nusRoomCode;
    venue.details.location = venue.details.location.wgs84;
    delete venue.details.location.z;

    remoteVenues[venue.corsRoomCode] = venue.details;
    /* eslint-enable */
  });

  // Merge remote data into local data. We take remote locations to be more correct,
  // while everything else we retain local data. We also ignore remote locations that
  // don't exist
  _.each(remoteVenues, (details, venue) => {
    const localVenue = localVenues[venue];
    if (!localVenue) {
      localVenues[venue] = details;
      return;
    }

    if (localVenue.floor === null) {
      localVenues[venue].floor = details.floor;
    }

    localVenue.location = details.location;
  });

  const missingVenues = _.difference(apiVenues, Object.keys(localVenues));
  console.log(`Venues in API but not in venues.json: ${missingVenues.length}`);
  console.log(missingVenues);

  const outdatedVenues = _.difference(Object.keys(localVenues), apiVenues);
  console.log(`Venues in venues.json but not in API: ${outdatedVenues.length}`);
  console.log(outdatedVenues);

  await fs.writeFile(localSource, JSON.stringify(localVenues, null, 2));
})();
