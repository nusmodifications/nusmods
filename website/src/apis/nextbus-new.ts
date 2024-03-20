import axios from 'axios';
import { BusStop } from 'types/buses';

import { NextBus, NextBusTime, NextBusTimings } from 'types/venues';

const baseUrl = 'https://nnextbus.nus.edu.sg';

interface ShuttleServiceResult {
  caption: string;
  name: string;
  shuttles: Shuttle[];
}

interface Shuttle {
  arrivalTime: string;
  name: string;
  nextArrivalTime: string;
  nextPassengers: string;
  passengers: string;
}

function convertArrivalTime(arrivalTime: string): NextBusTime {
  const numericTime = +arrivalTime;
  if (!Number.isNaN(numericTime)) return numericTime;
  if (arrivalTime === 'Arr' || arrivalTime === '-') return arrivalTime;
  throw new Error(`Unknown arrival time ${arrivalTime}`);
}

export function getStops(): Promise<BusStop[]> {
  const url = `${baseUrl}/BusStops`;
  return axios
    .get(url, {
      headers: {
        Authorization: process.env?.NEXTBUS_API_AUTH || '',
      },
    })
    .then((response) => response.data.BusStopsResult.busstops);
}

export function nextBus(code: string): Promise<any> {
  const url = `${baseUrl}/arrival`;
  return axios
    .get<{
      ShuttleServiceResult: ShuttleServiceResult;
    }>(url, { params: { busstopname: code } })
    .then((response) => {
      const shuttles: NextBusTimings = {};

      response.data.ShuttleServiceResult.shuttles.forEach((arrival: Shuttle) => {
        const timing: NextBus = {
          arrivalTime: convertArrivalTime(arrival.arrivalTime),
          nextArrivalTime: convertArrivalTime(arrival.nextArrivalTime),
        };

        shuttles[arrival.name] = timing;
      });

      return shuttles;
    });
}
