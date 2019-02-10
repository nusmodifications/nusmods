// @flow

import axios from 'axios';

import type { NextBus, NextBusTime, NextBusTimings } from 'types/venues';

const baseUrl = 'https://nextbus.nusmods.com';

function convertArrivalTime(arrivalTime: string): NextBusTime {
  const numericTime = +arrivalTime;
  if (!Number.isNaN(numericTime)) return numericTime;
  if (arrivalTime === 'Arr' || arrivalTime === '-') return arrivalTime;
  throw new Error(`Unknown arrival time ${arrivalTime}`);
}

// eslint-disable-next-line import/prefer-default-export
export function nextBus(code: string): Promise<NextBusTimings> {
  const url = `${baseUrl}/arrival`;
  return axios.get(url, { params: { busstopname: code } }).then((response) => {
    const shuttles: NextBusTimings = {};

    response.data.ShuttleServiceResult.shuttles.forEach((arrival) => {
      const timing: NextBus = {
        arrivalTime: convertArrivalTime(arrival.arrivalTime),
        nextArrivalTime: convertArrivalTime(arrival.nextArrivalTime),
      };

      shuttles[arrival.name] = timing;
    });

    return shuttles;
  });
}
