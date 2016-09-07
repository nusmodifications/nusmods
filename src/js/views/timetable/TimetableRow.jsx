import React, { PropTypes } from 'react';
import _ from 'lodash';
import classnames from 'classnames';

const CELLS_COUNT = 28;

const TimetableRow = (props) => {
  return (
    <div className="timetable-day-row">
      <div className="timetable-day-cell timetable-hour-cell"><span>{props.day}</span></div>
      {_.map(_.range(CELLS_COUNT), (i) => {
        return (
          <div key={i}
            className={classnames('timetable-hour-cell', {
              'timetable-hour-cell-alt': (i % 4 <= 1 && props.altBackground),
            })}
          />
        );
      })}
    </div>
  );
};

TimetableRow.propTypes = {
  day: PropTypes.string,
  altBackground: PropTypes.bool, // For different color timetable background
};

export default TimetableRow;
