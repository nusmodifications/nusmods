// @flow

import type { LatLng } from 'leaflet';
import React, { PureComponent } from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';
import classnames from 'classnames';
import axios from 'axios';

import type { LatLngTuple, VenueLocation } from 'types/venues';
import config from 'config';
import { MapPin, ThumbsUp } from 'views/components/icons';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { icon } from 'views/components/map/icons';
import ExpandMap from 'views/components/map/ExpandMap';
import mapStyles from 'views/components/map/LocationMap.scss';
import styles from './ImproveVenueForm.scss';

type Props = {
  venue: string,
  existingLocation?: ?VenueLocation,
  onBack?: () => void,
};

type State = {
  // Form data
  reporterEmail: string,
  roomName: string,
  floor: number,
  location: LatLngTuple,

  // Form state
  latlngUpdated: boolean,
  submitting: boolean,
  submitted: boolean,
  isMapExpanded: boolean,
  error?: any,
};

const wellKnownLocations = {
  'Central Library': [1.2966113099432135, 103.77322643995288],
  UTown: [1.304448761575499, 103.77278119325639],
  Science: [1.2964893900409042, 103.78065884113312],
  Engineering: [1.3002873614041492, 103.77067700028421],
  Computing: [1.2935772164129489, 103.7741592837536],
  "Prince George's Park": [1.2909124430918655, 103.78115504980089],
  'Bukit Timah Campus': [1.3189664358274156, 103.81760090589525],
};

export default class ImproveVenueForm extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { existingLocation } = props;
    const location = {
      roomName: '',
      floor: 1,
      location: wellKnownLocations['Central Library'],
    };

    // Make sure we copy only non-null values into the new location
    if (existingLocation) {
      location.roomName = existingLocation.roomName;

      if (typeof existingLocation.floor === 'number') {
        location.floor = existingLocation.floor;
      }

      if (existingLocation.location) {
        location.location = [existingLocation.location.y, existingLocation.location.x];
      }
    }

    this.state = {
      reporterEmail: '',
      latlngUpdated: false,
      submitting: false,
      submitted: false,
      isMapExpanded: false,
      ...location,
    };
  }

  onSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    this.setState({ submitting: true });

    const { reporterEmail, roomName, location, floor } = this.state;
    const { venue } = this.props;

    return axios
      .post(config.venueFeedbackApi, {
        venue,
        reporterEmail,
        floor,
        latlng: location,
        room: roomName,
      })
      .then(() => this.setState({ submitted: true }))
      .catch((error) => this.setState({ error }))
      .then(() => this.setState({ submitting: false }));
  };

  onMapJump = (evt: SyntheticEvent<HTMLSelectElement>) => {
    if (!(evt.target instanceof HTMLSelectElement)) {
      return;
    }

    const location = wellKnownLocations[evt.target.value];
    if (location) {
      this.setState({ location });
    }
  };

  geolocate = () => {
    navigator.geolocation.getCurrentPosition((position) =>
      this.updateLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }),
    );
  };

  updateLocation = (latlng: LatLng) => {
    const { lat, lng } = latlng;

    this.setState({
      location: [lat, lng],
      latlngUpdated: true,
    });
  };

  render() {
    const { location, reporterEmail, floor, roomName, isMapExpanded } = this.state;

    if (this.state.submitted) {
      return (
        <div className={styles.submitted}>
          <ThumbsUp />
          <p>
            Thank you for helping us improve NUSMods. If you have left your email, we will send you
            a message when your update goes live
          </p>
        </div>
      );
    }

    if (this.state.submitting) {
      return <LoadingSpinner />;
    }

    return (
      <form className="form-row" onSubmit={this.onSubmit}>
        {this.state.error && (
          <div className="col-sm-12">
            <div className="alert alert-warning">
              There was a problem submitting your feedback. Please try again later.
            </div>
          </div>
        )}

        <div className="form-group col-sm-12">
          <label htmlFor="improve-venue-email">Email (optional)</label>
          <input
            className="form-control"
            id="improve-venue-email"
            aria-describedby="improve-venue-email-help"
            type="email"
            placeholder="example@nusmods.com"
            value={reporterEmail}
            onChange={(evt) =>
              this.setState({
                reporterEmail: evt.target.value,
              })
            }
          />
          <small className="form-text text-muted" id="improve-venue-email-help">
            This will be visible publicly. If you fill this we can contact you when your
            contribution goes live.
          </small>
        </div>

        <div className="form-group col-sm-7">
          <label htmlFor="improve-venue-room">Room Name</label>
          <input
            className="form-control"
            id="improve-venue-room"
            type="text"
            placeholder="eg. Seminar Room 2, Physics Lab 5"
            value={roomName}
            onChange={(evt) =>
              this.setState({
                roomName: evt.target.value,
              })
            }
            required
          />
        </div>

        <div className="form-group col-sm-5">
          <label htmlFor="improve-venue-floor">What floor is this room on?</label>
          <input
            className="form-control"
            id="improve-venue-floor"
            aria-describedby="improve-venue-floor-help"
            type="number"
            step="1"
            placeholder="eg. 1"
            value={floor}
            onChange={(evt) =>
              this.setState({
                floor: parseInt(evt.target.value, 10),
              })
            }
            required
          />
          <small className="form-text text-muted" id="improve-venue-floor-help">
            Use negative numbers for basement floors
          </small>
        </div>

        <div
          className={classnames('col-sm-12', mapStyles.mapWrapper, {
            [mapStyles.expanded]: isMapExpanded,
          })}
        >
          <Map
            className={mapStyles.map}
            center={location}
            zoom={19}
            maxZoom={19}
            onClick={(evt) => this.updateLocation(evt.latlng)}
          >
            <Marker
              position={location}
              icon={icon}
              onDragEnd={(evt) => this.updateLocation(evt.target.getLatLng())}
              draggable
              autoPan
            />
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ExpandMap
              isExpanded={isMapExpanded}
              onToggleExpand={() => this.setState({ isMapExpanded: !isMapExpanded })}
            />
          </Map>

          <select
            className={classnames('form-control', styles.jumpSelect)}
            onChange={this.onMapJump}
          >
            <option>Jump to...</option>
            {Object.keys(wellKnownLocations).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <small
            className={classnames(styles.instructions, {
              [styles.moved]: this.state.latlngUpdated,
            })}
          >
            Drag marker or click on map so that the marker is pointing to the location.
          </small>

          {'geolocation' in navigator && (
            <button
              className={classnames('btn btn-sm btn-secondary', styles.geolocate)}
              title="Center on my location"
              aria-label="Center on my location"
              type="button"
              onClick={this.geolocate}
            >
              <MapPin /> Use my location
            </button>
          )}
        </div>

        <div className={classnames(styles.actions, 'col-sm-12')}>
          {this.props.onBack && (
            <button className="btn btn-lg btn-secondary" onClick={this.props.onBack}>
              Back
            </button>
          )}

          <button className="btn btn-lg btn-primary" type="submit">
            Submit
          </button>
        </div>
      </form>
    );
  }
}
