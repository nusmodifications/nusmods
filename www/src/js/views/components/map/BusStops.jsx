// @flow

import React, { PureComponent } from 'react';
import { Marker, Popup } from 'react-leaflet';
import classnames from 'classnames';
import produce from 'immer';

import type { BusStop } from 'types/venues';
import busStops from 'data/bus-stops.json';
import { allowBusStopEditing } from 'utils/debug';
import { DivIcon } from 'leaflet';
import styles from './BusStops.scss';

type Props = {};

type State = {
  busStops: BusStop[],
};

/**
 *
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
  };

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

  render() {
    const allowEditing = allowBusStopEditing();

    return (
      <>
        {this.state.busStops.map((stop: BusStop) => {
          const hitAreaClass = classnames(styles.hitArea, {
            [styles.editing]: allowEditing,
          });

          const icon = new DivIcon({
            html: `
              <div 
                title="${stop.name}" 
                data-code="${stop.code}" 
                class="${hitAreaClass}"
              ></div>`,
            className: styles.iconWrapper,
            iconSize: [30, 30],
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
              <Popup>
                <h3>{stop.name}</h3>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }
}
