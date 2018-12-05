// @flow
import React, { PureComponent } from 'react';
import LocationMap from 'views/components/map/LocationMap';

import classnames from 'classnames';
import { capitalize } from 'lodash';
import type { VenueLocation as VenueLocationItem } from 'types/venues';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import { floorName } from 'utils/venues';
/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';
import VenueContext from '../VenueContext';

import FeedbackModal from './FeedbackModal';
import ImproveVenueForm from './ImproveVenueForm';
import styles from './VenueLocation.scss';

export type OwnProps = {|
  +venue: string,
|};

type Props = {|
  ...OwnProps,
  // Provided by VenueContext
  +toggleScrollable: (boolean) => void,
|};

type State = {|
  +isFeedbackModalOpen: boolean,
  +isExpanded: boolean,
|};

class VenueLocation extends PureComponent<Props, State> {
  state: State = {
    isFeedbackModalOpen: false,
    isExpanded: false,
  };

  openModal = () => this.setState({ isFeedbackModalOpen: true });
  closeModal = () => this.setState({ isFeedbackModalOpen: false });
  toggleMapExpand = () => {
    const isExpanded = !this.state.isExpanded;

    this.setState({ isExpanded });
    if (this.props.toggleScrollable) {
      this.props.toggleScrollable(!isExpanded);
    }
  };

  render() {
    const { venue } = this.props;
    const location: ?VenueLocationItem = venueLocations[venue];

    if (!location) {
      return (
        <>
          <div className={styles.noLocation}>
            <p>We don&apos;t have data for this venue.</p>
            <button className="btn btn-primary btn-outline-primary" onClick={this.openModal}>
              Help us map this venue
            </button>
          </div>

          <Modal isOpen={this.state.isFeedbackModalOpen} onRequestClose={this.closeModal} animate>
            <CloseButton onClick={this.closeModal} />
            <h2 className={styles.feedbackTitle}>Improve {venue}</h2>
            <ImproveVenueForm venue={venue} />
          </Modal>
        </>
      );
    }

    const position = location.location ? [location.location.y, location.location.x] : null;

    return (
      <div className={styles.location}>
        <p>
          <strong>{capitalize(location.roomName)}</strong> ({venue})
          {location.floor && (
            <>
              {' '}
              is on <strong>floor {floorName(location.floor)}</strong>
            </>
          )}
          .
        </p>

        {position ? (
          <LocationMap position={position} toggleScrollable={this.props.toggleScrollable} />
        ) : (
          <>
            <p>We don&apos;t have the location of this venue.</p>
            <button className="btn btn-primary btn-outline-primary" onClick={this.openModal}>
              Help us map this venue
            </button>
          </>
        )}

        <p className={styles.feedbackBtn}>
          See a problem?{' '}
          <button
            className={classnames('btn btn-primary btn-outline-primary')}
            onClick={this.openModal}
          >
            Help us improve this map
          </button>
        </p>

        <FeedbackModal
          venue={venue}
          isOpen={this.state.isFeedbackModalOpen}
          onRequestClose={this.closeModal}
          existingLocation={location}
        />
      </div>
    );
  }
}

export default function(props: $Diff<Props, { toggleScrollable?: (boolean) => void }>) {
  return (
    <VenueContext.Consumer>
      {({ toggleDetailScrollable }) => (
        <>
          <VenueLocation toggleScrollable={toggleDetailScrollable} {...props} />
          <hr />
        </>
      )}
    </VenueContext.Consumer>
  );
}
