import axios, { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { toSingaporeTime } from 'utils/timify';

/** An empty object, i.e. `{}` */
type EmptyItem = Record<string, undefined>;

export type WeatherResponse<T> = {
  api_info: {
    status: string;
  };
  // API sometimes returns `[{}]` instead of an array of Ts, no idea why
  items: (T | EmptyItem)[];
};

type ValidPeriod = {
  start: string;
  end: string;
};

type HighLow = {
  low: number;
  high: number;
};

type Wind = {
  speed: HighLow;
  direction: string;
};

type Weather = {
  forecast: string;
  relative_humidity: HighLow;
  temperature: HighLow;
  wind: Wind;
};

type NowCastItem = {
  update_timestamp: string;
  timestamp: string;
  valid_period: ValidPeriod;
  forecasts: {
    area: string;
    forecast: string;
  }[];
};

type DayCastItem = {
  update_timestamp: string;
  timestamp: string;
  valid_period: ValidPeriod;
  general: Weather;
  periods: {
    time: ValidPeriod;
    regions: {
      west: string;
      east: string;
      central: string;
      south: string;
      north: string;
    };
  }[];
};

type FourDayCastItem = {
  update_timestamp: string;
  timestamp: string;
  forecasts: Forecast[];
};

export type Forecast = Weather & {
  date: string;
  timestamp: string;
};

const API_PREFIX = 'https://api.data.gov.sg/v1/environment';
const NOWCAST_AREA = 'Queenstown';

function getResponseData<T>(response: AxiosResponse<WeatherResponse<T>>): T | EmptyItem {
  const { data } = response;
  if (data.api_info.status !== 'healthy') {
    throw new Error(`Weather API returned non-healthy status ${data.api_info.status}`);
  }
  return data.items[data.items.length - 1];
}

export async function twoHour(date: Date): Promise<string | null> {
  const dateStr = format(toSingaporeTime(date), `yyyy-MM-dd`);
  const response = await axios.get<WeatherResponse<NowCastItem>>(
    `${API_PREFIX}/2-hour-weather-forecast?date=${dateStr}`,
  );
  const areaForecast = getResponseData(response).forecasts?.find(
    (forecast) => forecast.area === NOWCAST_AREA,
  );
  return areaForecast?.forecast ?? null;
}

export async function tomorrow(date: Date): Promise<string | null> {
  const dateStr = format(toSingaporeTime(date), `yyyy-MM-dd`);
  const response = await axios.get<WeatherResponse<DayCastItem>>(
    `${API_PREFIX}/24-hour-weather-forecast?date=${dateStr}`,
  );
  const { periods } = getResponseData(response);
  const tomorrowForecast = periods?.[periods.length - 1];
  return tomorrowForecast?.regions?.west ?? null;
}

export async function fourDay(date: Date): Promise<Forecast[]> {
  const dateStr = format(toSingaporeTime(date), `yyyy-MM-dd`);
  const response = await axios.get<WeatherResponse<FourDayCastItem>>(
    `${API_PREFIX}/4-day-weather-forecast?date=${dateStr}`,
  );
  return getResponseData(response).forecasts ?? [];
}
