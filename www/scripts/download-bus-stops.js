const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');

/**
 * Download bus stop location information from ComfortDelGro's
 * NUS NextBus API
 */

/* eslint-disable camelcase */

const routes = ['A1', 'A2', 'B1', 'B2', 'C', 'BTC1', 'BTC2', 'D1', 'D2'];
const getBusStop = 'https://nextbus.comfortdelgro.com.sg/eventservice.svc/busstops';
const getBusRoute = 'https://nextbus.comfortdelgro.com.sg/eventservice.svc/pickuppoint';

const dataPath = path.join(__dirname, '../src/js/data/bus-stops.json');

async function downloadBusStops() {
  const busStopResponse = await axios.get(getBusStop);
  const data = busStopResponse.data.BusStopsResult.busstops;

  // Map bus stops to the correct shape
  const busStops = {};
  data.forEach((stop) => {
    // Check that all expected keys are here
    if (!stop.caption || !stop.latitude || !stop.longitude || !stop.name) {
      console.log(data);
      throw new Error('Incomplete data - key not found');
    }

    busStops[stop.name] = {
      // Human readable name for the stop
      name: stop.caption,
      // Location as a latlng tuple
      location: [stop.latitude, stop.longitude],
      // Used for accessing the next bus API
      code: stop.name,
      // Array to hold bus routes in the next step
      routes: [],
    };
  });

  // Insert the bus stops for each route into their bus stops
  await Promise.all(
    routes.map(async (route_code) => {
      const response = await axios.get(getBusRoute, { params: { route_code } });
      response.data.PickupPointResult.pickuppoint.forEach((point) => {
        if (!point) return;

        if (!busStops[point.busstopcode]) {
          console.warn(point);
          console.warn(`For route ${route_code}`);
          return;
        }

        busStops[point.busstopcode].routes.push(route_code);
      });
    }),
  );

  return fs.outputJSON(dataPath, Object.values(busStops), { spaces: 2 });
}

if (require.main === module) {
  downloadBusStops();
}
