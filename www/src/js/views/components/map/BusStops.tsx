// @flow

import React, { PureComponent } from 'react';
import { Marker, Popup } from 'react-leaflet';
import classnames from 'classnames';
import produce from 'immer';
import { entries, sortBy } from 'lodash';

import type { BusStop, NextBus, NextBusTime } from 'types/venues';
import type { BusTiming } from 'types/views';

import busStops from 'data/bus-stops.json';
import { allowBusStopEditing } from 'utils/debug';
import { DivIcon } from 'leaflet';
import { nextBus } from 'apis/nextbus';
import { Refresh } from 'views/components/icons';
import styles from './BusStops.scss';

type Props = {};

type State = {|
  // Bus stop data is stored in state to allow for editing
  busStops: BusStop[],

  // Each stop has their own substate. This allows multiple timings to be
  // displayed at once.
  busTimings: { [code: string]: BusTiming },
|};

type ArrivalTimesProps = {|
  ...BusTiming,

  name: string,
  code: string,
  reload: (code: string) => void,
|};

/**
 * Extract the route name from the start of a string
 */
const routes = ['A1', 'A2', 'B1', 'B2', 'C', 'D1', 'D2', 'BTC1', 'BTC2'];
export function extractRoute(route: string) {
  for (let i = 0; i < routes.length; i++) {
    if (route.startsWith(routes[i])) return routes[i];
  }
  return null;
}

/**
 * Adds 'min' to numeric timings and highlight any buses that are arriving
 * soon with a <strong> tag
 */
function renderTiming(time: NextBusTime) {
  if (typeof time === 'number') {
    if (time <= 3) return <strong>{time} min</strong>;
    return `${time} min`;
  }

  if (time === 'Arr') return <strong>{time}</strong>;
  return time;
}

/**
 * Route names with parenthesis in them don't have a space in front of the
 * opening bracket, causing the text to wrap weirdly. This forces the opening
 * paren to always have a space in front of it.
 */
function fixRouteName(name: string) {
  return name.replace(/\s?\(/, ' (');
}

// By default set all timings to null
const defaultBusTimings = {};
busStops.forEach((stop: BusStop) => {
  const timing: BusTiming = {
    isLoading: false,
    timings: null,
    error: null,
  };

  defaultBusTimings[stop.code] = timing;
});

export const ArrivalTimes = React.memo<ArrivalTimesProps>((props) => {
  if (props.error) {
    return (
      <>
        <h3 className={styles.heading}>{props.name}</h3>
        <p>Error loading arrival times</p>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => props.reload(props.code)}
        >
          Retry
        </button>
      </>
    );
  }

  // Make sure the routes are sorted
  const timings = sortBy(entries(props.timings), ([route]) => route);

  return (
    <>
      <h3 className={styles.heading}>{props.name}</h3>
      {props.timings && (
        <table className={classnames(styles.timings, 'table table-sm')}>
          <tbody>
            {timings.map(([routeName, timing]: [string, NextBus]) => {
              const route = extractRoute(routeName);
              const className = route
                ? classnames(styles.routeHeading, styles[`route${route}`])
                : '';

              return (
                <tr key={routeName}>
                  <th className={className}>{fixRouteName(routeName)}</th>
                  <td>{renderTiming(timing.arrivalTime)}</td>
                  <td>{renderTiming(timing.nextArrivalTime)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        type="button"
        className={classnames('btn btn-sm btn-link btn-svg', styles.refreshBtn, {
          [styles.isLoading]: props.isLoading,
        })}
        disabled={props.isLoading}
        onClick={() => props.reload(props.code)}
      >
        <Refresh size={14} className={styles.refreshIcon} />
        {props.isLoading ? 'Loading...' : 'Refresh'}
      </button>
    </>
  );
});

/**
 * Displays bus stop routes as markers, and timings in a popup when they are clicked
 */
export default class BusStops extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    if (allowBusStopEditing()) {
      window.getState = () => this.state;

      // eslint-disable-next-line no-console
      console.log(
        'Bus stop editing enabled. Use getState() to the current state. Use copy(JSON.stringify(getState().busStops)) to copy the bus stop data to your clipboard',
      );
    }
  }

  state = {
    busStops,
    busTimings: defaultBusTimings,
  };

  // Only used for map editing
  // TODO: Find out how to properly type Leaflet events
  onDragEnd = (evt: any) => {
    if (!allowBusStopEditing()) return;

    const { target } = evt;
    const code = target.getElement().children[0].dataset.code;
    const { lat, lng } = target.getLatLng();

    this.setState(
      produce(this.state, (draft) => {
        const busStop = draft.busStops.find((stop) => stop.code === code);
        if (!busStop) {
          throw new Error(`Unrecognized bus stop ${code}`);
        }

        busStop.location = [lat, lng];
      }),
    );
  };

  /**
   * Reload the bus arrival timing data for the given bus stop
   */
  refreshBusTiming = (code: string) => {
    this.setState(
      produce(this.state, (draft) => {
        draft.busTimings[code].isLoading = true;
        // Reset error when reloading so the error message will disappear
        draft.busTimings[code].error = null;
      }),
    );

    nextBus(code)
      .then((timings) =>
        this.setState(
          produce(this.state, (draft) => {
            draft.busTimings[code].timings = timings;
            draft.busTimings[code].isLoading = false;
          }),
        ),
      )
      .catch((error) =>
        this.setState(
          produce(this.state, (draft) => {
            draft.busTimings[code].error = error;
            draft.busTimings[code].isLoading = false;
          }),
        ),
      );
  };

  render() {
    const allowEditing = allowBusStopEditing();
    const { busTimings } = this.state;

    return (
      <>
        {this.state.busStops.map((stop: BusStop) => {
          // The hit area is an invisible circle that covers the original
          // OSM bus stop so that it is clickable
          const hitAreaClass = classnames(styles.hitArea, {
            [styles.editing]: allowEditing,
          });

          // Routes are displayed to the left or right of the hit area
          const routeWrapperClass = classnames(styles.routeWrapper, {
            [styles.left]: stop.displayRoutesLeft,
          });

          const routeIndicators = stop.routes.map(
            (route) =>
              `<span class="${classnames(styles.route, styles[`route${route}`])}">${route}</span>`,
          );

          const icon = new DivIcon({
            html: `
              <div 
                title="${stop.name}" 
                data-code="${stop.code}" 
                class="${hitAreaClass}"
              ></div>
              <div class="${routeWrapperClass}">
                ${routeIndicators.join('')}
              </div>`,
            className: styles.iconWrapper,
            iconSize: [30, 30],
            // Move the popup a bit higher so it won't cover the bus stop icon
            popupAnchor: [0, -5],
          });

          return (
            <Marker
              key={stop.code}
              icon={icon}
              position={stop.location}
              onDragEnd={this.onDragEnd}
              draggable={allowEditing}
              autoPan={allowEditing}
            >
              <Popup onOpen={() => this.refreshBusTiming(stop.code)}>
                <ArrivalTimes
                  name={stop.name}
                  code={stop.code}
                  reload={this.refreshBusTiming}
                  {...busTimings[stop.code]}
                />
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }
}
