// @flow
import React, { Fragment, PureComponent } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import classnames from 'classnames';
import { capitalize } from 'lodash';
import type { LatLngTuple, VenueLocation as VenueLocationItem } from 'types/venues';
import ExternalLink from 'views/components/ExternalLink';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import { floorName } from 'utils/venues';
/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';
import VenueContext from 'views/venues/VenueContext';

import { icon } from './icons';
import FeedbackModal from './FeedbackModal';
import ImproveVenueForm from './ImproveVenueForm';
import ExpandMap from './ExpandMap';
import styles from './VenueLocation.scss';

type OwnProps = {|
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

LeafletMap.addInitHook('addHandler', 'gestureHandling', GestureHandling);

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
    this.props.toggleScrollable(!isExpanded);
  };

  renderMap(position: LatLngTuple) {
    // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
    const googleMapQuery = encodeURIComponent(position.join(','));
    const { isExpanded } = this.state;

    return (
      <div className={classnames(styles.mapWrapper, { [styles.expanded]: isExpanded })}>
        <ExternalLink
          href={`https://www.google.com/maps/search/?api=1&query=${googleMapQuery}`}
          className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
        >
          Open in Google Maps
        </ExternalLink>

        <Map center={position} zoom={18} maxZoom={19} className={styles.map}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={icon} />
          <ExpandMap isExpanded={isExpanded} onToggleExpand={this.toggleMapExpand} />
        </Map>
      </div>
    );
  }

  render() {
    const { venue } = this.props;
    const location: ?VenueLocationItem = venueLocations[venue];

    if (!location) {
      return (
        <Fragment>
          <div className={styles.noLocation}>
            <p>We don&apos;t have data for this venue.</p>
            <button className="btn btn-primary btn-outline-primary" onClick={this.openModal}>
              Help us map this venue
            </button>
            <hr />
          </div>

          <Modal isOpen={this.state.isFeedbackModalOpen} onRequestClose={this.closeModal} animate>
            <CloseButton onClick={this.closeModal} />
            <h2 className={styles.feedbackTitle}>Improve {venue}</h2>
            <ImproveVenueForm venue={venue} />
          </Modal>
        </Fragment>
      );
    }

    const position = location.location ? [location.location.y, location.location.x] : null;

    return (
      <div className={styles.location}>
        <p>
          <strong>{capitalize(location.roomName)}</strong> ({venue})
          {location.floor && (
            <Fragment>
              {' '}
              is on <strong>floor {floorName(location.floor)}</strong>
            </Fragment>
          )}.
        </p>

        {position ? (
          this.renderMap(position)
        ) : (
          <Fragment>
            <p>We don&apos;t have the location of this venue.</p>
            <button className="btn btn-primary btn-outline-primary" onClick={this.openModal}>
              Help us map this venue
            </button>
          </Fragment>
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

        <hr />

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

export default function(props: OwnProps) {
  return (
    <VenueContext.Consumer>
      {({ toggleDetailScrollable }) => (
        <VenueLocation toggleScrollable={toggleDetailScrollable} {...props} />
      )}
    </VenueContext.Consumer>
  );
}
