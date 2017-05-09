// @flow
import type { Lesson, LessonTime, ModifiableLesson } from 'types/modules';

import React from 'react';
import _ from 'lodash';

import { convertIndexToTime, convertTimeToIndex } from 'utils/timify';
import TimetableCell from './TimetableCell';

function generateCells(lessons?: Array<ModifiableLesson | Lesson>,
  cellSize: number, cellOrientationStyleProp: string,
  onModifyCell?: Function, startingIndex: number, endingIndex: number) {
  const lessonToStartTimeMap: {[time: LessonTime]: ModifiableLesson} = _.mapValues(
    _.groupBy(lessons, lesson => lesson.StartTime),
    value => value[0],
  );

  const cells = [];
  for (let i = startingIndex; i < endingIndex; i += 1) {
    const timeForIndex: LessonTime = convertIndexToTime(i);
    const lesson: ModifiableLesson = lessonToStartTimeMap[timeForIndex];
    if (lesson) {
      const lessonStartIndex: number = i;
      const lessonEndIndex: number = convertTimeToIndex(lesson.EndTime);
      const size: number = lessonEndIndex - lessonStartIndex;
      cells.push(
        <TimetableCell key={i}
          size={size * cellSize}
          styleProp={cellOrientationStyleProp}
          lesson={lesson}
          onModifyCell={onModifyCell}
        />,
      );
      i += (size - 1);
    } else {
      cells.push(<TimetableCell key={i} />);
    }
  }
  return cells;
}

type Props = {
  cellSize: number,
  cellOrientationStyleProp: string,
  horizontalOrientation?: boolean,
  scale?: number,
  startingIndex: number,
  endingIndex: number,
  lessons?: Array<ModifiableLesson | Lesson>,
  onModifyCell?: Function,
};

function TimetableRow(props: Props) {
  const style = {};
  if (!props.horizontalOrientation && props.scale) {
    style.width = `${props.scale}%`;
  }
  return (
    <div className="timetable-row" style={style}>
      {generateCells(props.lessons, props.cellSize, props.cellOrientationStyleProp,
        props.onModifyCell, props.startingIndex, props.endingIndex)}
    </div>
  );
}

export default TimetableRow;
