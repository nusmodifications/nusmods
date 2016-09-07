import React, { PropTypes } from 'react';
// import { connect } from 'react-redux';
import { arrangeLessonsForWeek } from 'utils/modules';

import TimetableBackground from './TimetableBackground';
import TimetableDayRow from './TimetableDayRow';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const Timetable = (props) => {
  const arrangedLessons = arrangeLessonsForWeek(props.lessons);
  return (
    <div className="timetable-container">
      <div className="timetable">
        {WEEKDAYS.map((weekday) => {
          return (
            <TimetableDayRow key={weekday}
              day={weekday.substring(0, 3)}
              dayLessonRows={arrangedLessons[weekday]}
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
