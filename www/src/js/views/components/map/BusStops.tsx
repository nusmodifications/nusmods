import * as React from 'react';
import { DivIcon, DragEndEvent } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import classnames from 'classnames';
import produce from 'immer';

import { BusStop } from 'types/venues';
import { BusTiming } from 'types/views';

import busStopJSON from 'data/bus-stops.json';
import { allowBusStopEditing } from 'utils/debug';
import { nextBus } from 'apis/nextbus';
import styles from './BusStops.scss';
import { ArrivalTimes } from './ArrivalTimes';

const busStops = busStopJSON as BusStop[];

type Props = {};

type State = {
  // Bus stop data is stored in state to allow for editing
  busStops: BusStop[];

  // Each stop has their own substate. This allows multiple timings to be
  // displayed at once.
  busTimings: { [code: string]: BusTiming };
};

// By default set all timings to null
const defaultBusTimings: { [code: string]: BusTiming } = {};
busStops.forEach((stop: BusStop) => {
  defaultBusTimings[stop.code] = {
    isLoading: false,
    timings: null,
    error: null,
  };
});

/**
 * Displays bus stop routes as markers, and timings in a popup when they are clicked
 */
export default class BusStops extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    if (allowBusStopEditing()) {
      // @ts-ignore
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
  onDragEnd = (evt: DragEndEvent) => {
    if (!allowBusStopEditing()) return;

    const { target } = evt;
    const code = target.getElement().children[0].dataset.code;
    const { lat, lng } = target.getLatLng();

    this.setState((state) =>
      produce(state, (draft) => {
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
    this.setState((state) =>
      produce(state, (draft) => {
        draft.busTimings[code].isLoading = true;
        // Reset error when reloading so the error message will disappear
        draft.busTimings[code].error = null;
      }),
    );

    nextBus(code)
      .then((timings) =>
        this.setState((state) =>
          produce(state, (draft) => {
            draft.busTimings[code].timings = timings;
            draft.busTimings[code].isLoading = false;
          }),
        ),
      )
      .catch((error) =>
        this.setState((state) =>
          produce(state, (draft) => {
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
