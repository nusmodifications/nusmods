import { FC, useCallback, useMemo, useState } from 'react';
import classnames from 'classnames';

import type {
  LatLngTuple,
  VenueLocation as VenueLocationItem,
  VenueLocationMap,
} from 'types/venues';

import Modal from 'views/components/Modal';
import LocationMap from 'views/components/map/LocationMap';
import CloseButton from 'views/components/CloseButton';
import { floorName } from 'utils/venues';

import FeedbackModal from './FeedbackModal';
import ImproveVenueForm from './ImproveVenueForm';
import styles from './VenueLocation.scss';

export type Props = {
  readonly venueLocations: VenueLocationMap;
  readonly venue: string;
};

const VenueLocation: FC<Props> = ({ venueLocations, venue }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const openModal = useCallback(() => setIsFeedbackModalOpen(true), []);
  const closeModal = useCallback(() => setIsFeedbackModalOpen(false), []);

  function renderFeedbackMenu(existingLocation: VenueLocationItem | null = null) {
    if (!existingLocation || !existingLocation.location) {
      return (
        <Modal isOpen={isFeedbackModalOpen} onRequestClose={closeModal} animate>
          <CloseButton onClick={closeModal} />
          <h2 className={styles.feedbackTitle}>Improve {venue}</h2>
          <ImproveVenueForm venue={venue} />
        </Modal>
      );
    }

    return (
      <FeedbackModal
        venue={venue}
        isOpen={isFeedbackModalOpen}
        onRequestClose={closeModal}
        existingLocation={existingLocation}
      />
    );
  }

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

        {renderFeedbackMenu()}
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
        </>
      ) : (
        <>
          <p>We don&apos;t have the location of this venue, sorry :(</p>
          <button type="button" className="btn btn-outline-primary" onClick={openModal}>
            Help us map this venue
          </button>
        </>
      )}

      {renderFeedbackMenu(location)}

      <hr />
    </div>
  );
};

export default VenueLocation;
