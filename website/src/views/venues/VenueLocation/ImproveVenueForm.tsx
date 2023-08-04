import * as React from 'react';
import type { LatLng } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import classnames from 'classnames';
import axios from 'axios';
import produce from 'immer';

import type { LatLngTuple, Venue, VenueLocation } from 'types/venues';
import config from 'config';
import { MapPin, ThumbsUp } from 'react-feather';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { markerIcon } from 'views/components/map/icons';
import ExpandMap from 'views/components/map/ExpandMap';
import MapViewportChanger from 'views/components/map/MapViewportChanger';
import { isIOS } from 'bootstrapping/browser';

import mapStyles from 'views/components/map/LocationMap.scss';
import { captureException } from 'utils/error';
import styles from './ImproveVenueForm.scss';

/**
 * Calls `onLocationSelected` whenever the map is dragged or clicked on.
 *
 * This component exists as passing `eventHandlers` to `MapContainer` has no
 * effect. See: https://github.com/PaulLeCam/react-leaflet/issues/779
 */
const MapLocationSelector: React.FC<{
  onLocationSelected: (latlng: LatLng, isFinal: boolean) => void;
}> = ({ onLocationSelected }) => {
  const map = useMapEvents({
    drag: () => onLocationSelected(map.getCenter(), false),
    dragend: () => onLocationSelected(map.getCenter(), true),
    click: ({ latlng }) => onLocationSelected(latlng, true),
  });
  return null;
};

type Props = {
  venue: Venue;
  existingLocation?: VenueLocation | null;
  onBack?: () => void;
};

type State = {
  // Form data
  reporterEmail: string;
  roomName: string;
  floor: number;
  location: LatLngTuple;

  // Form state
  latlngUpdated: boolean;
  submitting: boolean;
  submitted: boolean;
  isMapExpanded: boolean;
  promptUpdateMap: boolean;

  /**
   * Viewport center.
   *
   * `center` is stored as a separate state because it may be animated
   * separately from `location`. `center` may not be updated; use
   * `map.getCenter` if possible.
   */
  center: LatLng | LatLngTuple;

  error?: Error;
};

const centralLibraryLocation: LatLngTuple = [1.2966113099432135, 103.77322643995288];
const wellKnownLocations: Record<string, LatLngTuple> = {
  'Central Library': centralLibraryLocation,
  UTown: [1.304448761575499, 103.77278119325639],
  Science: [1.2964893900409042, 103.78065884113312],
  Engineering: [1.3002873614041492, 103.77067700028421],
  Computing: [1.2935772164129489, 103.7741592837536],
  "Prince George's Park": [1.2909124430918655, 103.78115504980089],
  'Bukit Timah Campus': [1.3189664358274156, 103.81760090589525],
};

export default class ImproveVenueForm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { existingLocation } = props;
    const locationInfo = {
      roomName: '',
      floor: 1,
      location: centralLibraryLocation,
    };

    // Make sure we copy only non-null values into the new location
    if (existingLocation) {
      locationInfo.roomName = existingLocation.roomName;

      if (typeof existingLocation.floor === 'number') {
        locationInfo.floor = existingLocation.floor;
      }

      if (existingLocation.location) {
        locationInfo.location = [existingLocation.location.y, existingLocation.location.x];
      }
    }

    this.state = {
      center: locationInfo.location,
      reporterEmail: '',
      latlngUpdated: false,
      submitting: false,
      submitted: false,
      isMapExpanded: false,
      promptUpdateMap: false,
      ...locationInfo,
    };
  }

  onSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    // Don't allow the user to submit without changing the latlng on the map
    if (!this.state.latlngUpdated) {
      // Shake the prompt a little to prompt the user to update the map
      this.setState({ promptUpdateMap: true });
      setTimeout(() => this.setState({ promptUpdateMap: false }), 500);
      return;
    }

    this.setState({ submitting: true });

    const { reporterEmail, roomName, location, floor } = this.state;
    const { venue } = this.props;

    axios
      .post(config.venueFeedbackApi, {
        venue,
        reporterEmail,
        floor,
        latlng: location,
        room: roomName,
      })
      .then(() => this.setState({ submitted: true }))
      .catch((originalError) => {
        const error = new Error(
          `Error while submitting improve venue form - ${originalError.message}`,
        );
        captureException(error, { originalError });
        this.setState({ error });
      })
      .then(() => this.setState({ submitting: false }));
  };

  onMapJump = (evt: React.SyntheticEvent<HTMLSelectElement>) => {
    if (!(evt.target instanceof HTMLSelectElement)) return;

    const location = wellKnownLocations[evt.target.value];
    if (location) this.updateLocation(location);
  };

  geolocate = () => {
    navigator.geolocation.getCurrentPosition((position) =>
      this.updateLocation([position.coords.latitude, position.coords.longitude]),
    );
  };

  updateLocation = (latlng: LatLng | LatLngTuple, updateViewport = true) => {
    this.setState((state) =>
      produce(state, (draft) => {
        const latlngTuple: [number, number] = Array.isArray(latlng)
          ? latlng
          : [latlng.lat, latlng.lng];
        draft.location = latlngTuple;
        draft.latlngUpdated = true;

        if (updateViewport) {
          draft.center = latlngTuple;
        }
      }),
    );
  };

  override render() {
    const { location, reporterEmail, floor, roomName, isMapExpanded } = this.state;

    if (this.state.submitted) {
      return (
        <div className={styles.submitted}>
          <ThumbsUp />
          <p>
            Thank you for helping us improve NUSMods. If you have left your email, we will send you
            a message when your update goes live!
          </p>
        </div>
      );
    }

    if (this.state.submitting) {
      return <LoadingSpinner />;
    }

    // HACK: There's an iOS bug that clips the expanded map around the modal,
    // making it impossible to exit the expanded state. While we find a better
    // solution for now we'll just hide the button
    const showExpandMapBtn = !isIOS;

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
            onChange={(evt) => this.setState({ reporterEmail: evt.target.value })}
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
            onChange={(evt) => this.setState({ roomName: evt.target.value })}
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
            onChange={(evt) => {
              const newFloor = parseInt(evt.target.value, 10);
              if (!Number.isNaN(newFloor)) {
                this.setState({ floor: newFloor });
              }
            }}
            required
          />
          <small className="form-text text-muted" id="improve-venue-floor-help">
            Use negative numbers for basement floors
          </small>
        </div>

        <div
          className={classnames('col-sm-12', mapStyles.mapWrapper, {
            [mapStyles.expanded!]: isMapExpanded,
          })}
        >
          <MapContainer className={mapStyles.map} center={this.state.center} zoom={18} maxZoom={18}>
            <MapViewportChanger center={this.state.center} />
            <MapLocationSelector onLocationSelected={this.updateLocation} />
            <Marker
              position={location}
              icon={markerIcon}
              eventHandlers={{
                dragend: (evt) => this.updateLocation(evt.target.getLatLng()),
              }}
              draggable
              autoPan
            />
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {showExpandMapBtn && (
              <ExpandMap
                isExpanded={isMapExpanded}
                onToggleExpand={() => this.setState({ isMapExpanded: !isMapExpanded })}
              />
            )}
          </MapContainer>

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
              [styles.moved!]: this.state.latlngUpdated,
              [styles.shake!]: this.state.promptUpdateMap,
            })}
          >
            Move marker or map so that marker is pointing to {this.props.venue}
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

        {showExpandMapBtn && (
          <p className={styles.fullscreenTip}>
            Tip: Open the map in fullscreen to easily edit the location
          </p>
        )}

        <div className={classnames(styles.actions, 'col-sm-12')}>
          {this.props.onBack && (
            <button type="button" className="btn btn-lg btn-secondary" onClick={this.props.onBack}>
              Back
            </button>
          )}

          <button
            className={classnames('btn btn-lg btn-primary', {
              disabled: !this.state.latlngUpdated,
            })}
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    );
  }
}
