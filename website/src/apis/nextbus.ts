import axios from 'axios';

import { NextBus, NextBusTime, NextBusTimings } from 'types/venues';

const baseUrl = 'https://nnextbus.nusmods.com';

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

export async function nextBus(name: string): Promise<NextBusTimings> {
  const url = `${baseUrl}/ShuttleService?busstopname=${name}`;
  const response = await axios.get<{
    ShuttleServiceResult: ShuttleServiceResult;
  }>(url, { params: { busstopname: name } });
  const shuttles: NextBusTimings = {};
  response.data.ShuttleServiceResult.shuttles.forEach((arrival: Shuttle) => {
    const timing: NextBus = {
      arrivalTime: convertArrivalTime(arrival.arrivalTime),
      nextArrivalTime: convertArrivalTime(arrival.nextArrivalTime),
    };
    shuttles[arrival.name] = timing;
  });
  return shuttles;
}
