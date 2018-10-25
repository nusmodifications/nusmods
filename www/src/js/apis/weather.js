// @flow
import axios from 'axios';
import { isSameDay, addDays } from 'date-fns';

export type Forecast = {
  temperature: {
    low: number,
    high: number,
  },
  date: string,
  forecast: string,
  relative_humidity: {
    low: number,
    high: number,
  },
  wind: {
    speed: {
      low: number,
      high: number,
    },
    direction: string,
  },
  timestamp: string,
};

const API_PREFIX = 'https://api.data.gov.sg/v1/environment';

export function twoHour(): Promise<string> {
  return axios
    .get(`${API_PREFIX}/2-hour-weather-forecast`)
    .then(
      (response) =>
        response.data.items[0].forecasts.find((forecast) => forecast.area === 'Queenstown')
          .forecast,
    );
}

export function tomorrow(): Promise<string> {
  return axios
    .get(`${API_PREFIX}/24-hour-weather-forecast`)
    .then(
      (response) =>
        response.data.items[0].periods.find((period) =>
          isSameDay(new Date(period.time.start), addDays(new Date(), 1)),
        ).regions.west,
    );
}

export function fourDay(): Promise<Forecast[]> {
  return axios
    .get(`${API_PREFIX}/4-day-weather-forecast`)
    .then((response) => response.data.items[0].forecasts);
}
