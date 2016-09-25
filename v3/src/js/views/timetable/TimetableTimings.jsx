// @flow

import React from 'react';
import _ from 'lodash';

import { convertIndexToTime } from 'utils/timify';

type Props = {
  startingIndex: number,
  endingIndex: number,
};

function TimetableTimings(props: Props) {
  return (
    <div className="timetable-timings">
      {_.range(props.startingIndex, props.endingIndex).map((i) => {
        return (
          <span key={i} className="timetable-cell">{i % 2 === 0 && convertIndexToTime(i)}</span>
        );
      })}
    </div>
  );
}

export default TimetableTimings;
