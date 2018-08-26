// @flow
import React, { Fragment, PureComponent } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import classnames from 'classnames';
import { capitalize } from 'lodash';
import type { VenueLocation as VenueLocationItem } from 'types/venues';
import ExternalLink from 'views/components/ExternalLink';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import { Map as MapIcon, MapPin } from 'views/components/icons';
import { floorName } from 'utils/venues';
import config from 'config';
import marker from 'img/marker-icon.png';
import marker2x from 'img/marker-icon-2x.png';

/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';
import styles from './VenueLocation.scss';

type Props = {
  venue: string,
};

type State = {
  isFeedbackModalOpen: boolean,
};

const icon = new Icon({
  iconUrl: marker,
  iconRetinaUrl: marker2x,
  // Copied from Icon.Default
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});

export default class VenueLocation extends PureComponent<Props, State> {
  state = {
    isFeedbackModalOpen: false,
  };

  onCloseFeedbackModal = () => this.setState({ isFeedbackModalOpen: false });

  render() {
    const location: ?VenueLocationItem = venueLocations[this.props.venue];

    if (!location) {
      return null;
    }

    const position = [location.location.y, location.location.x];
    // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
    const googleMapQuery = encodeURIComponent(position.join(','));

    return (
      <div className={styles.location}>
        <p>
          <strong>{capitalize(location.roomName)}</strong> ({this.props.venue}){' '}
          {location.floor && (
            <Fragment>
              is on <strong>floor {floorName(location.floor)}</strong>
            </Fragment>
          )}.
        </p>

        <div className={styles.mapWrapper}>
          <ExternalLink
            href={`https://www.google.com/maps/search/?api=1&query=${googleMapQuery}`}
            className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
          >
            Open in Google Maps
          </ExternalLink>
          <Map center={position} zoom={18} className={styles.map}>
            <TileLayer
              attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={icon} />
          </Map>
        </div>

        <button
          className={classnames(styles.feedbackBtn, 'btn btn-primary btn-outline-primary')}
          onClick={() => this.setState({ isFeedbackModalOpen: true })}
        >
          Report a problem
        </button>

        <hr />

        <Modal isOpen={this.state.isFeedbackModalOpen} onRequestClose={this.onCloseFeedbackModal}>
          <CloseButton onClick={this.onCloseFeedbackModal} />
          <div className="container">
            <div className={classnames('row', styles.feedback)}>
              <h2 className="col-sm-12">Report a problem</h2>

              <div className="col-sm-6">
                <ExternalLink href="https://www.openstreetmap.org/fixthemap">
                  <MapIcon />
                  <h3>Problem with map data</h3>
                  <p>eg. incorrect building outline, missing walkways</p>
                </ExternalLink>
              </div>

              <div className="col-sm-6">
                <ExternalLink href={config.contact.messenger}>
                  <MapPin />
                  <h3>Problem with venue data</h3>
                  <p>eg. incorrect room name, floor, location of the map pin</p>
                </ExternalLink>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
