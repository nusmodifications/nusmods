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

import { icon } from './icons';
import FeedbackModal from './FeedbackModal';
import styles from './VenueLocation.scss';
import ImproveVenueForm from './ImproveVenueForm';

type Props = {
  venue: string,
};

type State = {
  isFeedbackModalOpen: boolean,
  isFullscreen: boolean,
};

LeafletMap.addInitHook('addHandler', 'gestureHandling', GestureHandling);

function renderMap(position: LatLngTuple) {
  // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
  const googleMapQuery = encodeURIComponent(position.join(','));

  return (
    <div id="venue-map" className={styles.mapWrapper}>
      <ExternalLink
        href={`https://www.google.com/maps/search/?api=1&query=${googleMapQuery}`}
        className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
      >
        Open in Google Maps
      </ExternalLink>
      <Map center={position} zoom={18} maxZoom={19} className={styles.map} gestureHandling>
        <TileLayer
          attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon} />
      </Map>
    </div>
  );
}

export default class VenueLocation extends PureComponent<Props, State> {
  state = {
    isFeedbackModalOpen: false,
    isFullscreen: false,
  };

  openModal = () => this.setState({ isFeedbackModalOpen: true });
  closeModal = () => this.setState({ isFeedbackModalOpen: false });

  /**
   * Returns an `Array` of standard, or vendored function names from
   * the fullScreen API dependent on the current browser's support.
   * based on https://github.com/rafrex/fscreen/blob/master/src/index.js
   * @returns {Array} standard or vendored fullScreen API functions
   */
  getVendoredFullscreen = () => {
    const key = {
      fullscreenEnabled: 0,
      requestFullscreen: 1,
      onfullscreenchange: 2,
    };
    const moz = ['mozFullScreenEnabled', 'mozRequestFullScreen', 'onmozfullscreenchange'];
    const ms = ['msFullscreenEnabled', 'msRequestFullscreen', 'onmsfullscreenchange'];
    const webkit = [
      'webkitFullscreenEnabled',
      'webkitRequestFullscreen',
      'onwebkitfullscreenchange',
    ];

    return (
      ('fullscreenEnabled' in document && Object.keys(key)) ||
      (webkit[0] in document && webkit) ||
      (moz[0] in document && moz) ||
      (ms[0] in document && ms) ||
      []
    );
  };

  /**
   * Called by 'Fullscreen map' button. Handles the transition between
   * fullscreen and back. Ensures that the map sizing is adjusted
   * as appropriate.
   */
  fullscreenMap = () => {
    const leafletContainer = document.querySelector('.leaflet-container');
    const vendoredFullscreenAPI = this.getVendoredFullscreen();

    leafletContainer.style.width = '100vw';
    leafletContainer.style.height = '100vh';
    leafletContainer[vendoredFullscreenAPI[1]]();

    document[vendoredFullscreenAPI[2]] = () => {
      if (!this.state.isFullscreen) {
        // we are entering fullscreen
        this.setState({ isFullscreen: true });
      } else if (this.state.isFullscreen) {
        // we are exiting fullscreen
        this.setState({ isFullscreen: false });
        // reset the width and height of the `leafletContainer`
        leafletContainer.style.width = '';
        leafletContainer.style.height = '';
      }
    };
  };

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
            <h2 className={styles.feedbackTitle}>Improve {this.props.venue}</h2>
            <ImproveVenueForm venue={this.props.venue} />
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
          renderMap(position)
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
          <button className="btn btn-primary btn-outline-primary" onClick={this.fullscreenMap}>
            Fullscreen map
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
