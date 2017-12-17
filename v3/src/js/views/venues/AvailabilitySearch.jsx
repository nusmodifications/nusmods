// @flow

import React, { PureComponent } from 'react';
import { range } from 'lodash';
import type { VenueSearchOptions } from 'types/venues';
import { SCHOOLDAYS, timestamp } from 'utils/timify';

type Props = {
  isEnabled: boolean,
  searchOptions: VenueSearchOptions,
  onUpdate: (boolean, VenueSearchOptions) => void,
};

// Classes start at 8am
const CLASS_START_HOUR = 8;

export function defaultSearchOptions(): VenueSearchOptions {
  const now = new Date();

  // Set day of week - if it is not a school day, then set to Monday (0)
  let day = now.getDay();
  if (day >= SCHOOLDAYS.length) day = 0;

  // Set time - if the current time is outside class hours, set it to the
  // time of the earliest lesson
  const time = Math.max(now.getHours(), CLASS_START_HOUR);

  return {
    time,
    day,
    duration: 1,
  };
}

export default class AvailabilitySearch extends PureComponent<Props> {
  onUpdate = (event: Event, key: $Keys<VenueSearchOptions>) => {
    if (typeof event.target.value !== 'undefined') {
      const { isEnabled, searchOptions, onUpdate } = this.props;
      onUpdate(isEnabled, {
        ...searchOptions,
        [key]: +event.target.value,
      });
    }
  };

  render() {
    const { isEnabled, searchOptions, onUpdate } = this.props;

    return (
      <div>
        <button
          className="btn btn-outline-primary"
          onClick={() => onUpdate(!isEnabled, searchOptions)}
        >Find free rooms</button>
        {isEnabled &&
          <div>
            <div className="row">
              <div className="col form-group">
                <label htmlFor="venue-day">Day</label>
                <select
                  id="venue-day"
                  className="form-control"
                  value={searchOptions.day}
                  onChange={evt => this.onUpdate(evt, 'day')}
                >
                  {SCHOOLDAYS.map((name, day) => (
                    <option key={day} value={day}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="col form-group">
                <label htmlFor="venue-time">From</label>
                <select
                  id="venue-time"
                  className="form-control"
                  value={searchOptions.time}
                  onChange={evt => this.onUpdate(evt, 'time')}
                >
                  {range(CLASS_START_HOUR, 24).map(hour => (
                    <option key={hour} value={hour}>{timestamp(hour * 100)}</option>
                  ))}
                </select>
              </div>

              <div className="col form-group">
                <label htmlFor="venue-duration">To</label>
                <select
                  id="venue-duration"
                  className="form-control"
                  value={searchOptions.duration}
                  onChange={evt => this.onUpdate(evt, 'duration')}
                >
                  {range(1, 25 - searchOptions.time).map(hour => (
                    <option key={hour} value={hour}>{timestamp((searchOptions.time + hour) * 100)} ({hour} hr)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>}
      </div>
    );
  }
}
