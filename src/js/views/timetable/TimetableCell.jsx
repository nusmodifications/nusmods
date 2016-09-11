import React, { PropTypes } from 'react';
import classnames from 'classnames';

import { LESSON_TYPE_ABBREV } from 'utils/timetable';
import prefixer from 'utils/prefixer';

const TimetableCell = (props) => {
  const lesson = props.lesson;
  const widthStyle = props.width ? prefixer({ flexGrow: props.width }) : null;
  return (
    <div className="timetable-cell" style={widthStyle}>
      {lesson ?
        <div className={classnames('timetable-module-cell', {
          'is-modifiable': lesson.isModifiable,
          'is-available': lesson.isAvailable,
          'is-active': lesson.isActive,
        })}
          onClick={(event) => {
            event.stopPropagation();
            props.onModifyCell(lesson);
          }}
        >
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
  onModifyCell: PropTypes.func,
};

export default TimetableCell;
