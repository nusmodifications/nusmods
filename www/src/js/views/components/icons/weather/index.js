// @flow
import { captureException } from 'utils/error';

import Cloudy from './cloudy';
import Rain from './rain';
import Showers from './showers';
import Thunderstorm from './thunderstorm';
import Dust from './dust';
import Fog from './fog';
import Wind from './strong-wind';
import Sunny from './day-sunny';
import ClearNight from './night-clear';

// Weather icons from https://github.com/erikflowers/weather-icons

// Forecast description pulled from several months worth of forecasts
// from the nowcast endpoint, mapped by hand to the closest icon

export default function getWeatherIcon(description: string) {
  const cleanedDesc = description.toLowerCase().replace(/[^a-z ]+/g, '');

  // Fair (Day), Fair (Night), Fair & Warm
  if (cleanedDesc.includes('fair')) {
    return cleanedDesc.includes('night') ? ClearNight : Sunny;
  }

  // Hazy, Slightly Hazy
  if (cleanedDesc.includes('hazy') || cleanedDesc.includes('haze')) {
    return Dust;
  }

  // Mist
  if (cleanedDesc.includes('mist') || cleanedDesc.includes('fog')) {
    return Fog;
  }

  // Cloudy, Partly Cloudy (Day), Partly Cloudy (Night)
  if (cleanedDesc.includes('cloudy')) {
    return Cloudy;
  }

  // Thundery Showers, Heavy Thundery Showers, Heavy Thundery Showers with Gusty Winds
  if (cleanedDesc.includes('thunder')) {
    return Thunderstorm;
  }

  // Light Rain, Heavy Rain, Light Showers, Passing Showers, Moderate Rain,
  // Heavy Showers, Showers
  if (cleanedDesc.includes('rain') || cleanedDesc.includes('shower')) {
    return cleanedDesc.includes('light') ? Showers : Rain;
  }

  // Windy
  if (cleanedDesc.includes('wind')) {
    return Wind;
  }

  captureException(new Error('Unknown weather description'), { description });
  return null;
}
