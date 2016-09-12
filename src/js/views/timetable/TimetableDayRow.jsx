import React, { PropTypes } from 'react';

import TimetableRow from './TimetableRow';

const TimetableDayRow = (props) => {
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
};

TimetableDayRow.propTypes = {
  day: PropTypes.string,
  dayLessonRows: PropTypes.array,
  onModifyCell: PropTypes.func,
};

export default TimetableDayRow;
