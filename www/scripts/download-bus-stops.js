const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');

/**
 * Download bus stop location information from ComfortDelGro's
 * NUS NextBus API
 */

const url = 'https://nextbus.comfortdelgro.com.sg/eventservice.svc/busstops';
const dataPath = path.join(__dirname, '../src/js/data/bus-stops.json');

async function downloadBusStops() {
  const response = await axios.get(url);
  const data = response.data.BusStopsResult.busstops;

  // Map bus stops to the correct shape
  const busStops = data.map((stop) => {
    // Check that all expected keys are here
    if (!stop.caption || !stop.latitude || !stop.longitude || !stop.name) {
      console.log(data);
      throw new Error('Incomplete data - key not found');
    }

    return {
      // Human readable name for the stop
      name: stop.caption,
      // Location as a latlng tuple
      location: [stop.latitude, stop.longitude],
      // Used for accessing the next bus API
      code: stop.name,
    };
  });

  return fs.outputJSON(dataPath, busStops, { spaces: 2 });
}

if (require.main === module) {
  downloadBusStops();
}
