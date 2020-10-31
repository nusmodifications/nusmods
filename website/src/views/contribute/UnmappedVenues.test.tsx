import { shallow } from 'enzyme';
import { VenueLocationMap } from 'types/venues';
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
    const wrapper = shallow(
      <UnmappedVenuesComponent venueList={venueList} venueLocations={venueLocations} />,
    );

    const progressBar = wrapper.find('.progress').first();
    // Text should not be too long and we should only count venues with location
    // ie. LT17 counts but not LT19, so the percentage is 1/3
    expect(progressBar.text()).toMatch('33.3');
    expect(progressBar.text().length).toBeLessThanOrEqual(5);
  });
});
