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

function getResponseData(response) {
  const { data } = response;
  if (response.status >= 400 || data.api_info.status !== 'healthy') {
    throw new Error(`API returned non-healthy status ${data.api_info.status}`);
  }

  return data.items[0];
}

export function twoHour(): Promise<string> {
  return axios
    .get(`${API_PREFIX}/2-hour-weather-forecast`)
    .then(
      (response) =>
        getResponseData(response).forecasts.find((forecast) => forecast.area === 'Queenstown')
          .forecast,
    );
}

export function tomorrow(): Promise<string> {
  return axios
    .get(`${API_PREFIX}/24-hour-weather-forecast`)
    .then(
      (response) =>
        getResponseData(response).periods.find((period) =>
          isSameDay(new Date(period.time.start), addDays(new Date(), 1)),
        ).regions.west,
    );
}

export function fourDay(): Promise<Forecast[]> {
  return axios
    .get(`${API_PREFIX}/4-day-weather-forecast`)
    .then((response) => getResponseData(response).forecasts);
}
