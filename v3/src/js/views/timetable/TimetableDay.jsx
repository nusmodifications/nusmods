// @flow

import React from 'react';
import type { TimetableDayArrangement } from 'types/timetables';

import TimetableRow from './TimetableRow';

type Props = {
  day: string,
  dayLessonRows: TimetableDayArrangement,
  cellWidth: number,
  startingIndex: number,
  endingIndex: number,
  onModifyCell: Function,
};

function TimetableDay(props: Props) {
  return (
    <div className="timetable-day">
      {props.dayLessonRows ?
        props.dayLessonRows.map((dayLessonRow, i) => {
          return (
            <TimetableRow key={i}
              startingIndex={props.startingIndex}
              endingIndex={props.endingIndex}
              cellWidth={props.cellWidth}
              day={i === 0 ? props.day : ''}
              lessons={dayLessonRow}
              onModifyCell={props.onModifyCell}
            />
          );
        })
        :
        <TimetableRow day={props.day}
          cellWidth={props.cellWidth}
          startingIndex={props.startingIndex}
          endingIndex={props.endingIndex}
        />
      }
    </div>
  );
}

export default TimetableDay;
