import { PureComponent } from 'react';
import { DivIcon, DragEndEventHandlerFn } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import classnames from 'classnames';
import { produce } from 'immer';

import type { BusTiming, BusStop } from 'types/venues';
import type { EmptyProps } from 'types/utils';

import busStopsJson from 'data/bus-stops.json';
import { allowBusStopEditing } from 'utils/debug';
import { nextBus } from 'apis/nextbus';
import { extractRouteStyle, simplifyRouteName } from 'utils/venues';
import styles from './BusStops.scss';
import { ArrivalTimes } from './ArrivalTimes';

const busStops = busStopsJson as BusStop[];

type Props = EmptyProps;

type State = {
  // Bus stop data is stored in state to allow for editing
  busStops: BusStop[];

  // Each stop has their own substate. This allows multiple timings to be
  // displayed at once.
  busTimings: { [code: string]: BusTiming };
};

// By default set all timings to null
const defaultBusTimings: { [code: string]: BusTiming } = {};
busStops.forEach((stop) => {
  defaultBusTimings[stop.name] = {
    isLoading: false,
    timings: null,
    error: null,
  };
});

/**
 * Displays bus stop routes as markers, and timings in a popup when they are clicked
 */
export default class BusStops extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    if (allowBusStopEditing()) {
      // For debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).getState = () => this.state;

      // eslint-disable-next-line no-console
      console.log(
        'Bus stop editing enabled. Use getState() to the current state. Use copy(JSON.stringify(getState().busStops)) to copy the bus stop data to your clipboard',
      );
    }
  }

  override state = {
    busStops,
    busTimings: defaultBusTimings,
  };

  // Only used for map editing
  onDragEnd: DragEndEventHandlerFn = (evt) => {
    if (!allowBusStopEditing()) return;

    const { target } = evt;
    const { code } = target.getElement().children[0].dataset;
    const { lat, lng } = target.getLatLng();

    this.setState((state) =>
      produce(state, (draft) => {
        const busStop = draft.busStops.find((stop) => stop.name === code);
        if (!busStop) {
          throw new Error(`Unrecognized bus stop ${code}`);
        }

        busStop.latitude = lat;
        busStop.longitude = lng;
      }),
    );
  };

  /**
   * Reload the bus arrival timing data for the given bus stop
   */
  refreshBusTiming = async (code: string) => {
    this.setState((state) =>
      produce(state, (draft) => {
        draft.busTimings[code].isLoading = true;
        // Reset error when reloading so the error message will disappear
        draft.busTimings[code].error = null;
      }),
    );

    try {
      const timings = await nextBus(code);
      this.setState((state) =>
        produce(state, (draft) => {
          draft.busTimings[code].timings = timings;
          draft.busTimings[code].isLoading = false;
        }),
      );
    } catch (error) {
      this.setState((state) =>
        produce(state, (draft) => {
          draft.busTimings[code].error = error;
          draft.busTimings[code].isLoading = false;
        }),
      );
    }
  };

  override render() {
    const allowEditing = allowBusStopEditing();
    const { busTimings } = this.state;

    return (
      <>
        {this.state.busStops.map((stop) => {
          // The hit area is an invisible circle that covers the original
          // OSM bus stop so that it is clickable
          const hitAreaClass = classnames(styles.hitArea, {
            [styles.editing]: allowEditing,
          });

          // Routes are displayed to the left or right of the hit area
          const routeWrapperClass = classnames(styles.routeWrapper, {
            [styles.left]: stop.leftLabel,
          });

          const routeIndicators = stop.shuttles.map(
            (shuttle) =>
              `<span class="${classnames(
                styles.route,
                styles[`route${extractRouteStyle(shuttle.name)}`],
              )}">${simplifyRouteName(shuttle.name)}</span>`,
          );

          const icon = new DivIcon({
            // language=HTML
            html: `
              <div
                title="${stop.caption}"
                data-code="${stop.name}"
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
              key={stop.name}
              icon={icon}
              position={[stop.latitude, stop.longitude]}
              eventHandlers={{
                dragend: this.onDragEnd,
              }}
              draggable={allowEditing}
              autoPan={allowEditing}
            >
              <Popup>
                <ArrivalTimes
                  name={stop.caption}
                  code={stop.name}
                  reload={this.refreshBusTiming}
                  {...busTimings[stop.name]}
                />
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }
}
