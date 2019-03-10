import axios from 'axios';
import venueLocationsLocal from 'data/venues';
import { mockResponse } from 'test-utils/axios';
import { getVenueLocations } from './github';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

afterEach(() => {
  mockAxios.get.mockReset();
  getVenueLocations.clear();
});

describe(getVenueLocations, () => {
  test('should load venues from proxy if possible', async () => {
    const venueLocations = {
      LT19: {
        roomName: 'Lecture Theatre 19',
      },
    };

    mockAxios.get.mockResolvedValue(mockResponse(venueLocations));

    await expect(getVenueLocations()).resolves.toEqual(venueLocations);
  });

  test('should fall back to import if proxy is not available', async () => {
    mockAxios.get.mockRejectedValue(new Error('The server is on fire'));

    await expect(getVenueLocations()).resolves.toEqual(venueLocationsLocal);
  });
});
