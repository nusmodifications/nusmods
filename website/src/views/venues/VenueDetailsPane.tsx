import { FC, memo, useCallback, useMemo, useState } from 'react';
import { Map } from 'react-feather';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';

import type { TimePeriod, VenueDetailList } from 'types/venues';

import { venuePage } from 'views/routes/paths';
import Modal from 'views/components/Modal';
import NoFooter from 'views/layout/NoFooter';
import MapContext from 'views/components/map/MapContext';
import useMediaQuery from 'views/hooks/useMediaQuery';
import { breakpointDown } from 'utils/css';
import VenueDetails from './VenueDetails';

import styles from './VenuesContainer.scss';

type Props = {
  highlightPeriod?: TimePeriod;
  matchedVenues: VenueDetailList;
  selectedVenue?: string;
  venues: VenueDetailList;
};

const VenueDetailsPaneComponent: FC<Props> = ({
  highlightPeriod,
  matchedVenues,
  selectedVenue,
  venues,
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const history = useHistory();
  const onClearVenueSelect = useCallback(
    () =>
      history.push({
        ...history.location,
        pathname: venuePage(),
      }),
    [history],
  );

  const matchBreakpoint = useMediaQuery(breakpointDown('sm'));

  const venueDetailProps = useMemo(() => {
    if (!venues || !selectedVenue) return null;

    // Find the index of the current venue on the list of matched venues so
    // we can obtain the previous and next item
    const lowercaseSelectedVenue = selectedVenue.toLowerCase();
    const venueIndex = matchedVenues.findIndex(
      ([venue]) => venue.toLowerCase() === lowercaseSelectedVenue,
    );

    // The selected item may not be in the list of matched venues (if the user
    // changed their search options afterwards), in which case we look for it in all
    // venues
    if (venueIndex === -1) {
      const venueDetail = venues.find(([venue]) => venue.toLowerCase() === lowercaseSelectedVenue);
      if (!venueDetail) return null;
      const [venue, availability] = venueDetail;
      return { venue, availability, next: undefined, previous: undefined };
    }

    const [venue, availability] = matchedVenues[venueIndex];
    const [previous] = matchedVenues[venueIndex - 1] ?? [];
    const [next] = matchedVenues[venueIndex + 1] ?? [];
    return { venue, availability, next, previous };
  }, [matchedVenues, selectedVenue, venues]);

  return (
    <MapContext.Provider value={{ toggleMapExpanded: setIsMapExpanded }}>
      {matchBreakpoint ? (
        <Modal
          isOpen={selectedVenue != null}
          onRequestClose={onClearVenueSelect}
          className={styles.venueDetailModal}
          fullscreen
        >
          <button
            type="button"
            className={classnames('btn btn-outline-primary btn-block', styles.closeButton)}
            onClick={onClearVenueSelect}
          >
            Back to Venues
          </button>
          {venueDetailProps && (
            <VenueDetails {...venueDetailProps} highlightPeriod={highlightPeriod} />
          )}
        </Modal>
      ) : (
        <>
          <div
            className={classnames(styles.venueDetail, {
              [styles.mapExpanded]: isMapExpanded,
            })}
          >
            {venueDetailProps ? (
              <VenueDetails {...venueDetailProps} highlightPeriod={highlightPeriod} />
            ) : (
              <div className={styles.noVenueSelected}>
                <Map />
                <p>Select a venue on the left to see its timetable</p>
              </div>
            )}
          </div>
          <NoFooter />
        </>
      )}
    </MapContext.Provider>
  );
};

export default memo(VenueDetailsPaneComponent);
