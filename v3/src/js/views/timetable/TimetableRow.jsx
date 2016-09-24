// @flow

import React from 'react';
import _ from 'lodash';

import { convertIndexToTime, convertTimeToIndex } from 'utils/timify';
import type { Lesson, LessonTime } from 'types/modules';
import TimetableCell from './TimetableCell';

function generateCells(lessons?: Array<Lesson>, cellWidth: number, onModifyCell?: Function,
                        startingIndex: number, endingIndex: number) {
  const lessonToStartTimeMap: {[time: LessonTime]: Lesson} = _.mapValues(
    _.groupBy(lessons, lesson => lesson.StartTime),
    value => value[0]
  );

  const cells = [];
  for (let i = startingIndex; i < endingIndex; i += 1) {
    const timeForIndex: LessonTime = convertIndexToTime(i);
    const lesson: Lesson = lessonToStartTimeMap[timeForIndex];
    if (lesson) {
      const lessonStartIndex: number = i;
      const lessonEndIndex: number = convertTimeToIndex(lesson.EndTime);
      const width: number = lessonEndIndex - lessonStartIndex;
      cells.push(
        <TimetableCell key={i}
          width={width * cellWidth}
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
  cellWidth: number,
  startingIndex: number,
  endingIndex: number,
  lessons?: Array<Lesson>,
  onModifyCell?: Function,
};

function TimetableRow(props: Props) {
  return (
    <div className="timetable-row">
      {generateCells(props.lessons, props.cellWidth, props.onModifyCell, props.startingIndex, props.endingIndex)}
    </div>
  );
}

export default TimetableRow;
