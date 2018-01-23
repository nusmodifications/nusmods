// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { range } from 'lodash';

import type { VenueSearchOptions } from 'types/venues';
import { SCHOOLDAYS, formatHour, getCurrentDayIndex, getCurrentHours } from 'utils/timify';
import styles from './AvailabilitySearch.scss';

type Props = {
  className?: string,
  isEnabled: boolean,
  searchOptions: VenueSearchOptions,
  onUpdate: (VenueSearchOptions) => void,
};

// The first and last starting time of lessons
const FIRST_CLASS_HOUR = 8;
const LAST_CLASS_HOUR = 22;
const CLASS_START_HOURS = range(FIRST_CLASS_HOUR, LAST_CLASS_HOUR + 1);

export function defaultSearchOptions(
  now: Date = new Date(), // Used for tests only
): VenueSearchOptions {
  // Set day of week - if it is not a school day, then set to Monday (0)
  const day = Math.max(getCurrentDayIndex(now), 0);

  // Set time - if the current time is outside class hours, set it to the
  // time of the earliest lesson
  const time = Math.max(getCurrentHours(now), FIRST_CLASS_HOUR);

  return {
    time,
    day,
    duration: 1,
  };
}

export default class AvailabilitySearch extends PureComponent<Props> {
  onUpdate = (event: Event, key: $Keys<VenueSearchOptions>) => {
    if (typeof event.target.value !== 'undefined') {
      const { searchOptions, onUpdate } = this.props;
      onUpdate({
        ...searchOptions,
        [key]: +event.target.value,
      });
    }
  };

  render() {
    const { searchOptions, className } = this.props;

    return (
      <div className={classnames(className, styles.search)}>
        <div className="form-group">
          <label htmlFor="venue-day">On</label>
          <select
            id="venue-day"
            className="form-control"
            value={searchOptions.day}
            onChange={(evt) => this.onUpdate(evt, 'day')}
          >
            {SCHOOLDAYS.map((name, day) => (
              <option key={day} value={day}>
                {name}s
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="venue-time">From</label>
          <select
            id="venue-time"
            className="form-control"
            value={searchOptions.time}
            onChange={(evt) => this.onUpdate(evt, 'time')}
          >
            {CLASS_START_HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {formatHour(hour)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="venue-duration">To</label>
          <select
            id="venue-duration"
            className="form-control"
            value={searchOptions.duration}
            onChange={(evt) => this.onUpdate(evt, 'duration')}
          >
            {range(1, LAST_CLASS_HOUR + 3 - searchOptions.time).map((hour) => (
              <option key={hour} value={hour}>
                {formatHour(searchOptions.time + hour)} ({hour} {hour === 1 ? 'hr' : 'hrs'})
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}
