// @flow

import Cloudy from 'img/weather/cloudy.svg';
import Rain from 'img/weather/rain.svg';
import Showers from 'img/weather/showers.svg';
import Thunderstorm from 'img/weather/thunderstorm.svg';
import Dust from 'img/weather/dust.svg';
import Fog from 'img/weather/fog.svg';
import Wind from 'img/weather/strong-wind.svg';
import Sunny from 'img/weather/day-sunny.svg';
import ClearNight from 'img/weather/night-clear.svg';
import getWeatherIcon from './weather';

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
