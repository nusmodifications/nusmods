import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { CELLS_COUNT } from 'utils/timetable';

function TimetableBackground() {
  return (
    <div className="timetable timetable-bg">
      <div className="timetable-day">
        <div className="timetable-day-row">
          <div className="timetable-day-cell timetable-cell"><span/></div>
          {_.range(CELLS_COUNT).map((i) => {
            return (
              <div key={i}
                className={classnames('timetable-cell', {
                  'timetable-cell-alt': i % 4 < 2,
                })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TimetableBackground;
