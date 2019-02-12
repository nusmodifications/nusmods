const twoHour = jest.fn().mockResolvedValue('Partially Cloudy (Day)');

const tomorrow = jest.fn().mockResolvedValue('Morning thundery showers.');

const fourDay = jest.fn().mockResolvedValue({
  temperature: { low: 23, high: 32 },
  date: '2016-10-27',
  forecast: 'Afternoon thundery showers.',
  relative_humidity: {
    low: 60,
    high: 95,
  },
  wind: {
    speed: {
      low: 10,
      high: 20,
    },
    direction: 'NE',
  },
  timestamp: '2016-10-27T00:00:00+08:00',
});

export { twoHour, tomorrow, fourDay };
