import { PureComponent } from 'react';
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

type State = {
  readonly isFeedbackModalOpen: boolean;
};

export default class VenueLocation extends PureComponent<Props, State> {
  override state: State = {
    isFeedbackModalOpen: false,
  };

  openModal = () => this.setState({ isFeedbackModalOpen: true });

  closeModal = () => this.setState({ isFeedbackModalOpen: false });

  renderFeedbackMenu(existingLocation: VenueLocationItem | null = null) {
    const { venue } = this.props;
    const { isFeedbackModalOpen } = this.state;

    if (!existingLocation || !existingLocation.location) {
      return (
        <Modal isOpen={isFeedbackModalOpen} onRequestClose={this.closeModal} animate>
          <CloseButton onClick={this.closeModal} />
          <h2 className={styles.feedbackTitle}>Improve {venue}</h2>
          <ImproveVenueForm venue={venue} />
        </Modal>
      );
    }

    return (
      <FeedbackModal
        venue={venue}
        isOpen={isFeedbackModalOpen}
        onRequestClose={this.closeModal}
        existingLocation={existingLocation}
      />
    );
  }

  override render() {
    const { venue, venueLocations } = this.props;
    const location = venueLocations[venue];

    if (!location) {
      return (
        <>
          <div className={styles.noLocation}>
            <p>We don&apos;t have data for this venue.</p>
            <button type="button" className="btn btn-outline-primary" onClick={this.openModal}>
              Help us map this venue
            </button>
          </div>

          {this.renderFeedbackMenu()}
        </>
      );
    }

    const position: LatLngTuple | null = location.location
      ? [location.location.y, location.location.x]
      : null;

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
                onClick={this.openModal}
              >
                Help us improve this map
              </button>
            </p>
          </>
        ) : (
          <>
            <p>We don&apos;t have the location of this venue, sorry :(</p>
            <button type="button" className="btn btn-outline-primary" onClick={this.openModal}>
              Help us map this venue
            </button>
          </>
        )}

        {this.renderFeedbackMenu(location)}

        <hr />
      </div>
    );
  }
}
