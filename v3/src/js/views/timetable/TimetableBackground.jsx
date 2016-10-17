// @flow
import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

type Props = {
  numberOfCells: number,
};

function TimetableBackground(props: Props) {
  return (
    <div className="timetable-bg">
      <div className="timetable-day">
        <div className="timetable-row">
          {_.range(props.numberOfCells).map((i) => {
            return (
              <span key={i}
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
