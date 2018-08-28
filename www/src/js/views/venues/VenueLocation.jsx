// @flow
import React, { Fragment, PureComponent } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import classnames from 'classnames';
import { capitalize, each } from 'lodash';
import qs from 'query-string';
import type { LatLngTuple, VenueLocation as VenueLocationItem } from 'types/venues';
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

function renderMap(position: LatLngTuple) {
  // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
  const googleMapQuery = encodeURIComponent(position.join(','));

  return (
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
  );
}

function getFeedbackFormUrl(venue: string, location: ?VenueLocationItem = null) {
  // Merge venue and existing location data
  const formValues: Object = {
    venue,
  };

  if (location) {
    formValues.room = location.roomName;

    if (location.floor) {
      formValues.floor = location.floor;
    }

    if (location.location) {
      formValues.latlng = `${location.location.y}, ${location.location.x}`;
    }
  }

  // Convert existing data into query string to pre-fill the form
  const query = {};
  each(formValues, (value, key) => {
    query[config.venueFeedbackForm.query[key]] = value;
  });

  return `${config.venueFeedbackForm.url}${qs.stringify(query)}`;
}

export default class VenueLocation extends PureComponent<Props, State> {
  state = {
    isFeedbackModalOpen: false,
  };

  onCloseFeedbackModal = () => this.setState({ isFeedbackModalOpen: false });

  render() {
    const { venue } = this.props;
    const location: ?VenueLocationItem = venueLocations[venue];

    if (!location) {
      return (
        <div className={styles.noLocation}>
          <p>We don&apos;t have data for this venue.</p>
          <ExternalLink
            className="btn btn-primary btn-outline-primary"
            href={getFeedbackFormUrl(venue)}
          >
            Help us map this venue
          </ExternalLink>
          <hr />
        </div>
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
            <ExternalLink
              className="btn btn-primary btn-outline-primary"
              href={getFeedbackFormUrl(venue, location)}
            >
              Help us map this venue
            </ExternalLink>
          </Fragment>
        )}

        <p className={styles.feedbackBtn}>
          See a problem? Help us{' '}
          <button
            className={classnames('btn btn-primary btn-outline-primary')}
            onClick={() => this.setState({ isFeedbackModalOpen: true })}
          >
            Improve this map
          </button>
        </p>

        <hr />

        <Modal
          isOpen={this.state.isFeedbackModalOpen}
          onRequestClose={this.onCloseFeedbackModal}
          animate
        >
          <CloseButton onClick={this.onCloseFeedbackModal} />
          <div className="container">
            <div className={classnames('row flex-fill', styles.feedback)}>
              <h2 className="col-sm-12">Improve {venue}</h2>

              <div className="col-sm-6">
                <ExternalLink href="https://www.openstreetmap.org/fixthemap">
                  <MapIcon />
                  <h3>Problem with map data</h3>
                  <p>eg. incorrect building outline, missing walkways</p>
                </ExternalLink>
              </div>

              <div className="col-sm-6">
                <ExternalLink href={getFeedbackFormUrl(venue, location)}>
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
