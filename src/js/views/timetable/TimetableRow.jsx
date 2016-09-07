import React, { PropTypes } from 'react';
import _ from 'lodash';
import classnames from 'classnames';

const FIRST_HOUR = 8;
const LAST_HOUR = 22;
const CELLS_COUNT = (LAST_HOUR - FIRST_HOUR) * 2;

const TimetableRow = (props) => {
  return (
    <div className="timetable-day-row">
      <div className="timetable-day-cell timetable-hour-cell"><span>{props.day}</span></div>
      {_.map(_.range(CELLS_COUNT), (i) => {
        return (
          <div key={i}
            className={classnames('timetable-hour-cell', {
              'timetable-hour-cell-alt': (i % 4 < 2 && props.altBackground),
            })}
          />
        );
      })}
    </div>
  );
};

TimetableRow.propTypes = {
  day: PropTypes.string,
  altBackground: PropTypes.bool, // Used for timetable's striped background
};

export default TimetableRow;
