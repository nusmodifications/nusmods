// @flow
import axios from 'axios';
import { isSameDay, addDays } from 'date-fns';

/**
 * Download weather forecast from data.gov NEA APIs
 * https://data.gov.sg/dataset/weather-forecast
 */

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
  if (data.api_info.status !== 'healthy') {
    throw new Error(`API returned non-healthy status ${data.api_info.status}`);
  }

  return data.items[0];
}

/**
 * Returns a string for the weather forecast for the next two hours in the
 * Queenstown (NUS) area
 */
export function twoHour(): Promise<string> {
  return axios
    .get(`${API_PREFIX}/2-hour-weather-forecast`)
    .then(
      (response) =>
        getResponseData(response).forecasts.find((forecast) => forecast.area === 'Queenstown')
          .forecast,
    );
}

/**
 * Returns a string for the weather forecast for tomorrow morning in the West.
 * May return null if the forecast is not available.
 */
export function tomorrow(): Promise<?string> {
  return axios.get(`${API_PREFIX}/24-hour-weather-forecast`).then((response) => {
    const tomorrowForecast = getResponseData(response).periods.find((period) =>
      isSameDay(new Date(period.time.start), addDays(new Date(), 1)),
    );

    // The forecast for tomorrow may not be available, so this can return null
    return tomorrowForecast ? tomorrowForecast.regions.west : null;
  });
}

/**
 * Return an array of Forecast objects representing the next four day's weathers
 */
export function fourDay(): Promise<Forecast[]> {
  return axios
    .get(`${API_PREFIX}/4-day-weather-forecast`)
    .then((response) => getResponseData(response).forecasts);
}
