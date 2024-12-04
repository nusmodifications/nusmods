import { VenueLocationMap } from 'types/venues';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnmappedVenuesComponent } from './UnmappedVenues';

describe(UnmappedVenuesComponent, () => {
  const venueList = ['LT17', 'COM1-0210', 'LT19'];
  const venueLocations: VenueLocationMap = {
    LT17: {
      roomName: 'Lecture Theatre 17',
      location: { x: 0, y: 0 },
      floor: 1,
    },
    LT19: {
      roomName: 'Lecture Theatre 19',
      floor: 1,
    },
  };

  test('should show percentage in progress bar', () => {
    render(
      <MemoryRouter>
        <UnmappedVenuesComponent venueList={venueList} venueLocations={venueLocations} />{' '}
      </MemoryRouter>,
    );

    const progressBar = screen.getByRole('progressbar');
    // Text should not be too long and we should only count venues with location
    // ie. LT17 counts but not LT19, so the percentage is 1/3
    expect(progressBar).toHaveTextContent('33.3');
  });
});
