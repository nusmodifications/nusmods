// @flow

import React from 'react';
import _ from 'lodash';

import { FIRST_HOUR, LAST_HOUR } from 'utils/timetable';
import { convertIndexToTime, convertTimeToIndex } from 'utils/timify';
import type { Lesson, LessonTime } from 'types/modules';
import TimetableCell from './TimetableCell';

function generateCells(lessons?: Array<Lesson>, onModifyCell?: Function) {
  const lessonToStartTimeMap: {[time: LessonTime]: Lesson} = _.mapValues(
    _.groupBy(lessons, lesson => lesson.StartTime),
    value => value[0]
  );

  const cells = [];
  const startingIndex: number = FIRST_HOUR * 2;
  const endingIndex: number = (LAST_HOUR + 1) * 2;
  for (let i = startingIndex; i < endingIndex; i += 1) {
    const timeForIndex: LessonTime = convertIndexToTime(i);
    const lesson: Lesson = lessonToStartTimeMap[timeForIndex];
    if (lesson) {
      const lessonStartIndex: number = i;
      const lessonEndIndex: number = convertTimeToIndex(lesson.EndTime);
      const width: number = lessonEndIndex - lessonStartIndex;
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
}

type Props = {
  day: string,
  lessons?: Array<Lesson>,
  onModifyCell?: Function,
};

function TimetableRow(props: Props) {
  return (
    <div className="timetable-day-row">
      <div className="timetable-day-cell timetable-cell"><span>{props.day}</span></div>
      {generateCells(props.lessons, props.onModifyCell)}
    </div>
  );
}

export default TimetableRow;
