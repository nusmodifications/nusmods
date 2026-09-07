import { NativeSelect } from 'components/ui/native-select';
import { Label } from 'components/ui/label';
import * as React from 'react';
import classnames from 'classnames';
import { range } from 'lodash-es';

import { VenueSearchOptions } from 'types/venues';
import { SCHOOLDAYS, formatHour, getDayIndex } from 'utils/timify';
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
  const time = Math.max(now.getHours(), FIRST_CLASS_HOUR);

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
        <Label htmlFor="venue-day">On</Label>
        <NativeSelect
          id="venue-day"
          value={searchOptions.day}
          onChange={(evt) => onUpdateInner(evt, 'day')}
        >
          {SCHOOLDAYS.map((name, day) => (
            <option key={day} value={day}>
              {name}s
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="form-group">
        <Label htmlFor="venue-time">From</Label>
        <NativeSelect
          id="venue-time"
          value={searchOptions.time}
          onChange={(evt) => onUpdateInner(evt, 'time')}
        >
          {CLASS_START_HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {formatHour(hour)}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="form-group">
        <Label htmlFor="venue-duration">To</Label>
        <NativeSelect
          id="venue-duration"
          value={searchOptions.duration}
          onChange={(evt) => onUpdateInner(evt, 'duration')}
        >
          {range(1, LAST_CLASS_HOUR + 3 - searchOptions.time).map((hour) => (
            <option key={hour} value={hour}>
              {formatHour(searchOptions.time + hour)} ({hour} {hour === 1 ? 'hr' : 'hrs'})
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
});

export default AvailabilitySearch;
