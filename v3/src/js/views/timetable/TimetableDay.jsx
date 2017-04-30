// @flow
import type { TimetableDayArrangement } from 'types/timetables';

import React from 'react';

import TimetableRow from './TimetableRow';

type Props = {
  day: string,
  dayLessonRows: TimetableDayArrangement,
  cellSize: number,
  horizontalOrientation: boolean,
  cellOrientationStyleProp: string,
  startingIndex: number,
  endingIndex: number,
  onModifyCell: Function,
};

function TimetableDay(props: Props) {
  const numOfRows: number = props.dayLessonRows ? props.dayLessonRows.length : 1;
  const style: Object = {};
  if (!props.horizontalOrientation) {
    style.flexGrow = numOfRows;
    style.WebkitBoxFlex = numOfRows;
    style.msFlexPositive = numOfRows;
  }

  return (
    <div className="timetable-day" style={style}>
      <div className="timetable-day-cell">
        <div className="timetable-day-cell-text">{props.day}</div>
      </div>
      <div className="timetable-day-rows">
        {props.dayLessonRows ?
          props.dayLessonRows.map((dayLessonRow, i) => {
            return (
              <TimetableRow key={i}
                startingIndex={props.startingIndex}
                endingIndex={props.endingIndex}
                cellSize={props.cellSize}
                cellOrientationStyleProp={props.cellOrientationStyleProp}
                horizontalOrientation={props.horizontalOrientation}
                scale={100 / props.dayLessonRows.length}
                lessons={dayLessonRow}
                onModifyCell={props.onModifyCell}
              />
            );
          }) :
          <TimetableRow day={props.day}
            cellSize={props.cellSize}
            cellOrientationStyleProp={props.cellOrientationStyleProp}
            startingIndex={props.startingIndex}
            endingIndex={props.endingIndex}
            />
        }
      </div>
    </div>
  );
}

export default TimetableDay;
