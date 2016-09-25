// @flow

import React from 'react';
import _ from 'lodash';

import { convertIndexToTime, convertTimeToIndex } from 'utils/timify';
import type { Lesson, LessonTime } from 'types/modules';
import TimetableCell from './TimetableCell';

function generateCells(lessons?: Array<Lesson>, cellSize: number, cellOrientationStyleProp: string,
                        onModifyCell?: Function, startingIndex: number, endingIndex: number) {
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
      const size: number = lessonEndIndex - lessonStartIndex;
      cells.push(
        <TimetableCell key={i}
          size={size * cellSize}
          styleProp={cellOrientationStyleProp}
          lesson={lesson}
          onModifyCell={onModifyCell}
        />
      );
      i += (size - 1);
    } else {
      cells.push(<TimetableCell key={i}/>);
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
  lessons?: Array<Lesson>,
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
