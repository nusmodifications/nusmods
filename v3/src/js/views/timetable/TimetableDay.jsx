// @flow

import React from 'react';
import type { TimetableDayArrangement } from 'types/timetables';

import TimetableRow from './TimetableRow';

type Props = {
  day: string,
  dayLessonRows: TimetableDayArrangement,
  onModifyCell: Function,
};

function TimetableDay(props: Props) {
  return (
    <div className="timetable-day">
      {props.dayLessonRows ?
        props.dayLessonRows.map((dayLessonRow, i) => {
          return (
            <TimetableRow key={i}
              day={i === 0 ? props.day : ''}
              lessons={dayLessonRow}
              onModifyCell={props.onModifyCell}
            />
          );
        }) : <TimetableRow day={props.day}/>
      }
    </div>
  );
}

export default TimetableDay;
