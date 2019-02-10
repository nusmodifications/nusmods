// @flow

import axios from 'axios';
import { nextBus } from 'apis/nextbus';
import arrival from './__mocks__/arrival.json';

jest.mock('axios');

describe(nextBus, () => {
  beforeEach(() => {
    // $FlowFixMe
    axios.get = jest.fn().mockResolvedValue({
      data: arrival,
    });
  });

  test('should extract arrival times', async () => {
    await expect(nextBus('STAFFCLUB-OPP')).resolves.toEqual({
      A1: {
        arrivalTime: 'Arr',
        nextArrivalTime: 19,
      },
      A1E: {
        arrivalTime: 1,
        nextArrivalTime: '-',
      },
      D2: {
        arrivalTime: 2,
        nextArrivalTime: 17,
      },
      C: {
        arrivalTime: 11,
        nextArrivalTime: 25,
      },
    });
  });
});
