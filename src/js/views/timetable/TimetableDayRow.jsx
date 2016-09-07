import React, { PropTypes } from 'react';

import TimetableRow from './TimetableRow';

const TimetableDayRow = (props) => {
  return (
    <div className="timetable-day">
      {props.dayLessonRows ?
        props.dayLessonRows.map((dayLessonRow, i) => {
          return (
            <TimetableRow day={i === 0 ? props.day : ''} key={i} lessons={dayLessonRow}/>
          );
        }) : <TimetableRow day={props.day}/>
      }
    </div>
  );
};

TimetableDayRow.propTypes = {
  day: PropTypes.string,
  dayLessonRows: PropTypes.array,
};

export default TimetableDayRow;
