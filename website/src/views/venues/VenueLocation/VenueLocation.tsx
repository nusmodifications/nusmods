import { FC, useCallback, useMemo, useState } from 'react';
import classnames from 'classnames';

import type { LatLngTuple, VenueLocationMap } from 'types/venues';

import LocationMap from 'views/components/map/LocationMap';
import { floorName } from 'utils/venues';

import AddLocationModal from './AddLocationModal';
import FeedbackModal from './FeedbackModal';
import styles from './VenueLocation.scss';

export type Props = {
  readonly venueLocations: VenueLocationMap;
  readonly venue: string;
};

const VenueLocation: FC<Props> = ({ venueLocations, venue }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const openModal = useCallback(() => setIsFeedbackModalOpen(true), []);
  const closeModal = useCallback(() => setIsFeedbackModalOpen(false), []);

  const location = venueLocations[venue];
  const position: LatLngTuple | null = useMemo(
    () => (location?.location ? [location.location.y, location.location.x] : null),
    [location],
  );

  if (!location) {
    return (
      <>
        <div className={styles.noLocation}>
          <p>We don&apos;t have data for this venue.</p>
          <button type="button" className="btn btn-outline-primary" onClick={openModal}>
            Help us map this venue
          </button>
        </div>
        <AddLocationModal venue={venue} isOpen={isFeedbackModalOpen} onRequestClose={closeModal} />
      </>
    );
  }

  return (
    <div>
      <p>
        <strong>{location.roomName}</strong> ({venue})
        {location.floor != null && (
          <>
            {' '}
            is on <strong>{floorName(location.floor)}</strong>
          </>
        )}
        .
      </p>

      {position ? (
        <>
          <LocationMap position={position} />
          <p className={styles.feedbackBtn}>
            See a problem?{' '}
            <button
              type="button"
              className={classnames('btn btn-outline-primary')}
              onClick={openModal}
            >
              Help us improve this map
            </button>
          </p>
          <FeedbackModal
            venue={venue}
            isOpen={isFeedbackModalOpen}
            onRequestClose={closeModal}
            existingLocation={location}
          />
        </>
      ) : (
        <>
          <p>We don&apos;t have the location of this venue, sorry :(</p>
          <button type="button" className="btn btn-outline-primary" onClick={openModal}>
            Help us map this venue
          </button>
          <AddLocationModal
            venue={venue}
            isOpen={isFeedbackModalOpen}
            onRequestClose={closeModal}
          />
        </>
      )}
      <hr />
    </div>
  );
};

export default VenueLocation;
