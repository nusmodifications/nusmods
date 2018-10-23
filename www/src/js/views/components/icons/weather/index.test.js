// @flow

import getWeatherIcon from './index';
import Cloudy from './cloudy';
import Rain from './rain';
import Showers from './showers';
import Thunderstorm from './thunderstorm';
import Dust from './dust';
import Fog from './fog';
import Wind from './strong-wind';
import Sunny from './day-sunny';
import ClearNight from './night-clear';

describe(getWeatherIcon, () => {
  it.each([
    ['Mist', Fog],
    ['Light Rain', Showers],
    ['Heavy Rain', Rain],
    ['Fair (Night)', ClearNight],
    ['Fair & Warm', Sunny],
    ['Heavy Thundery Showers', Thunderstorm],
    ['Light Showers', Showers],
    ['Cloudy', Cloudy],
    ['Thundery Showers', Thunderstorm],
    ['Passing Showers', Rain],
    ['Moderate Rain', Rain],
    ['Partly Cloudy (Day)', Cloudy],
    ['Fair (Day)', Sunny],
    ['Heavy Thundery Showers with Gusty Winds', Thunderstorm],
    ['Heavy Showers', Rain],
    ['Slightly Hazy', Dust],
    ['Partly Cloudy (Night)', Cloudy],
    ['Hazy', Dust],
    ['Showers', Rain],
    ['Windy', Wind],
  ])('%s', (desc, expected) => {
    expect(getWeatherIcon(desc)).toBe(expected);
  });
});
