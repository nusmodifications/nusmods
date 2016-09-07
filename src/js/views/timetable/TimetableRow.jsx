import React, { PropTypes } from 'react';
import _ from 'lodash';

import { FIRST_HOUR, LAST_HOUR, LESSON_TYPE_ABBREV } from 'utils/timetable';
import { convertIndexToTime, convertTimeToIndex } from 'utils/timify';

const generateCells = (lessons) => {
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
        <div key={i} className="timetable-hour-cell"
          style={{ flexGrow: width }}>
          <div className="timetable-cell">
            <div className="cell-module-code">{lesson.ModuleCode}</div>
            <div>
              <span className="cell-module-lesson-type">{LESSON_TYPE_ABBREV[lesson.LessonType]}</span>
              <span className="cell-module-class">{' '}[{lesson.ClassNo}]</span>
            </div>
            <div><span className="cell-module-venue">{lesson.Venue}</span></div>
          </div>
        </div>
      );
      i += (width - 1);
    } else {
      cells.push(<div key={i} className="timetable-hour-cell"/>);
    }
  }
  return cells;
};

const TimetableRow = (props) => {
  return (
    <div className="timetable-day-row">
      <div className="timetable-day-cell timetable-hour-cell"><span>{props.day}</span></div>
      {generateCells(props.lessons)}
    </div>
  );
};

TimetableRow.propTypes = {
  day: PropTypes.string,
  lessons: PropTypes.array,
};

export default TimetableRow;
