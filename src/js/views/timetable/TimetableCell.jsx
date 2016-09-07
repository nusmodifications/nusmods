import React, { PropTypes } from 'react';
import { LESSON_TYPE_ABBREV } from 'utils/timetable';

const TimetableCell = (props) => {
  const lesson = props.lesson;
  const widthStyle = props.width ? { flexGrow: props.width } : null;
  return (
    <div className="timetable-cell"
      style={widthStyle}
    >
      {lesson ?
        <div className="timetable-module-cell">
          <div className="cell-module-code">{lesson.ModuleCode}</div>
          <div>
            <span className="cell-module-lesson-type">{LESSON_TYPE_ABBREV[lesson.LessonType]}</span>
            <span className="cell-module-class">{' '}[{lesson.ClassNo}]</span>
          </div>
          <div><span className="cell-module-venue">{lesson.Venue}</span></div>
        </div> : null
      }
    </div>
  );
};

TimetableCell.propTypes = {
  lesson: PropTypes.object,
  width: PropTypes.number,
};

export default TimetableCell;
