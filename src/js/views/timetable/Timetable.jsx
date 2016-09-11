import React, { PropTypes } from 'react';
// import { connect } from 'react-redux';

import TimetableBackground from './TimetableBackground';
import TimetableDayRow from './TimetableDayRow';

const SCHOOLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = (props) => {
  return (
    <div className="timetable-container">
      <div className="timetable">
        {SCHOOLDAYS.map((day) => {
          const dayDisplayText = day.substring(0, 3);
          if (day === 'Saturday' && !props.lessons.Saturday) {
            return null;
          }
          return (
            <TimetableDayRow key={dayDisplayText}
              onModifyCell={props.onModifyCell}
              day={dayDisplayText}
              dayLessonRows={props.lessons[day]}
            />
          );
        })}
      </div>
      <TimetableBackground/>
    </div>
  );
};

Timetable.propTypes = {
  lessons: PropTypes.object,
  onModifyCell: PropTypes.func,
};

export default Timetable;
