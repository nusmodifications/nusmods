// @flow

import React, { PureComponent } from 'react';
import { type LatLng, Map, Marker, TileLayer } from 'react-leaflet';
import classnames from 'classnames';
import axios from 'axios';
import type { VenueLocation } from 'types/venues';
import config from 'config';
import { icon } from './icons';
import styles from './ImproveVenueForm.scss';

type Props = {
  venue: string,
  existingLocation?: VenueLocation,
  onBack: () => void,
};

type State = {
  reporterEmail: string,
  latlngUpdated: boolean,
  roomName: string,
  floor: number,
  location: { x: number, y: number },
};

const wellKnownLocations = {
  'Central Library': { y: 1.2966113099432135, x: 103.77322643995288 },
  UTown: { y: 1.304448761575499, x: 103.77278119325639 },
  Science: { y: 1.2964893900409042, x: 103.78065884113312 },
  Engineering: { y: 1.3002873614041492, x: 103.77067700028421 },
  "Prince George's Park": {
    y: 1.2909124430918655,
    x: 103.78115504980089,
  },
  'Bukit Timah Campus': {
    y: 1.3189664358274156,
    x: 103.81760090589525,
  },
};

export default class ImproveVenueForm extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { existingLocation } = props;
    const location = {
      roomName: '',
      floor: 1,
      location: { y: 1.2974523, x: 103.7736379 },
    };

    // Make sure we copy only non-null values into the new location
    if (existingLocation) {
      location.roomName = existingLocation.roomName;

      if (typeof existingLocation.floor === 'number') {
        location.floor = existingLocation.floor;
      }

      if (existingLocation.location) {
        location.location = existingLocation.location;
      }
    }

    this.state = {
      reporterEmail: '',
      latlngUpdated: false,
      ...location,
    };
  }

  onSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const { reporterEmail, roomName, location, floor } = this.state;
    const { venue } = this.props;

    return axios.post(config.venueFeedbackApi, {
      venue,
      reporterEmail,
      floor,
      latlng: location,
      room: roomName,
    });
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

  updateLocation = (latlng: LatLng) => {
    const { lat, lng } = latlng;

    this.setState({
      location: { y: lat, x: lng },
      latlngUpdated: true,
    });
  };

  render() {
    const { location, reporterEmail, floor, roomName } = this.state;
    const position = [location.y, location.x];

    return (
      <form className="form-row" onSubmit={this.onSubmit}>
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

        <div className={classnames('col-sm-12', styles.mapWrapper)}>
          <Map
            className={styles.map}
            center={position}
            zoom={19}
            maxZoom={19}
            onClick={(evt) => this.updateLocation(evt.latlng)}
          >
            <Marker
              position={position}
              icon={icon}
              onDragEnd={(evt) => this.updateLocation(evt.target.getLatLng())}
              draggable
              autopan
            />
            <TileLayer
              attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        </div>

        <div className="col-sm-12">
          <button className="btn btn-lg btn-primary" type="submit">
            Submit
          </button>
          <button className="btn btn-link" onClick={this.props.onBack}>
            Back
          </button>
        </div>
      </form>
    );
  }
}
