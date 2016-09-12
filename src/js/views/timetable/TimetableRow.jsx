import React, { PropTypes } from 'react';
import _ from 'lodash';

import { FIRST_HOUR, LAST_HOUR } from 'utils/timetable';
import { convertIndexToTime, convertTimeToIndex } from 'utils/timify';

import TimetableCell from './TimetableCell';

const generateCells = (lessons, onModifyCell) => {
  const lessonsGroupedByStartTime = _(lessons).groupBy('StartTime').mapValues((value) => {
    return value[0];
  }).value();
  const cells = [];
  const startingIndex = FIRST_HOUR * 2;
  const endingIndex = (LAST_HOUR + 1) * 2;
  for (let i = startingIndex; i < endingIndex; i++) {
    const timeForIndex = convertIndexToTime(i);
    const lesson = lessonsGroupedByStartTime[timeForIndex];
    if (lesson) {
      const lessonStartIndex = i;
      const lessonEndIndex = convertTimeToIndex(lesson.EndTime);
      const width = lessonEndIndex - lessonStartIndex;
      cells.push(
        <TimetableCell key={i}
          width={width}
          lesson={lesson}
          onModifyCell={onModifyCell}
        />
      );
      i += (width - 1);
    } else {
      cells.push(<TimetableCell key={i}/>);
    }
  }
  return cells;
};

const TimetableRow = (props) => {
  return (
    <div className="timetable-day-row">
      <div className="timetable-day-cell timetable-cell"><span>{props.day}</span></div>
      {generateCells(props.lessons, props.onModifyCell)}
    </div>
  );
};

TimetableRow.propTypes = {
  day: PropTypes.string,
  lessons: PropTypes.array,
  onModifyCell: PropTypes.func,
};

export default TimetableRow;
