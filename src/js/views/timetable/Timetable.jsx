import React, { PropTypes } from 'react';
// import { connect } from 'react-redux';
import { arrangeLessonsForWeek } from 'utils/timetable';

import TimetableBackground from './TimetableBackground';
import TimetableDayRow from './TimetableDayRow';

const SCHOOLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = (props) => {
  const arrangedLessons = arrangeLessonsForWeek(props.lessons);
  return (
    <div className="timetable-container">
      <div className="timetable">
        {SCHOOLDAYS.map((day) => {
          const dayDisplayText = day.substring(0, 3);
          if (day === 'Saturday' && !arrangedLessons.Saturday) {
            return null;
          }
          return (
            <TimetableDayRow key={dayDisplayText}
              day={dayDisplayText}
              dayLessonRows={arrangedLessons[day]}
            />
          );
        })}
      </div>
      <TimetableBackground/>
    </div>
  );
};

Timetable.propTypes = {
  lessons: PropTypes.array,
};

export default Timetable;
