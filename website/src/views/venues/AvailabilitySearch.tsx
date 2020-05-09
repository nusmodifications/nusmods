import * as React from 'react';
import classnames from 'classnames';
import { range } from 'lodash';

import { VenueSearchOptions } from 'types/venues';
import { SCHOOLDAYS, formatHour, getDayIndex, getCurrentHours } from 'utils/timify';
import { FIRST_CLASS_HOUR, LAST_CLASS_HOUR } from 'utils/venues';
import styles from './AvailabilitySearch.scss';

type Props = {
  className?: string;
  isEnabled: boolean;
  searchOptions: VenueSearchOptions;
  onUpdate: (venueSearchOptions: VenueSearchOptions) => void;
};

const CLASS_START_HOURS = range(FIRST_CLASS_HOUR, LAST_CLASS_HOUR + 1);

export function defaultSearchOptions(
  now: Date = new Date(), // Used for tests only
): VenueSearchOptions {
  // Set day of week - if it is not a school day, then set to Monday (0)
  const day = getDayIndex(now) === 6 ? 0 : getDayIndex(now);

  // Set time - if the current time is outside class hours, set it to the
  // time of the earliest lesson
  const time = Math.max(getCurrentHours(now), FIRST_CLASS_HOUR);

  return {
    time,
    day,
    duration: 1,
  };
}

const AvailabilitySearch = React.memo<Props>(({ className, searchOptions, onUpdate }) => {
  const onUpdateInner = (
    event: React.SyntheticEvent<HTMLSelectElement>,
    key: keyof VenueSearchOptions,
  ) => {
    if (typeof event.currentTarget.value !== 'undefined') {
      onUpdate({
        ...searchOptions,
        [key]: +event.currentTarget.value,
      });
    }
  };

  return (
    <div className={classnames(className, styles.search)}>
      <div className="form-group">
        <label htmlFor="venue-day">On</label>
        <select
          id="venue-day"
          className="form-control"
          value={searchOptions.day}
          onChange={(evt) => onUpdateInner(evt, 'day')}
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
          onChange={(evt) => onUpdateInner(evt, 'time')}
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
          onChange={(evt) => onUpdateInner(evt, 'duration')}
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
});

export default AvailabilitySearch;
