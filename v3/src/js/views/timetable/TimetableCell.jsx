// @flow
import type { ModifiableLesson } from 'types/modules';

import React from 'react';
import classnames from 'classnames';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';

type Props = {
  lesson?: ModifiableLesson,
  size?: number,
  styleProp?: string,
  onModifyCell?: Function,
};

function TimetableCell(props: Props) {
  const lesson = props.lesson;
  let cell = null;
  const style = {};
  if (props.size && props.styleProp) {
    style[props.styleProp] = `${props.size}%`;
  }

  if (lesson) {
    cell = (
      <div className={classnames('timetable-module-cell', {
        'is-modifiable': lesson.isModifiable,
        'is-available': lesson.isAvailable,
        'is-active': lesson.isActive,
        [`color-${lesson.colorIndex}`]: true,
      })}
        onClick={(event) => {
          event.stopPropagation();
          if (props.onModifyCell) {
            props.onModifyCell(lesson);
          }
        }}
      >
        <div className="cell-module-code">{lesson.ModuleCode}</div>
        <div>
          <span className="cell-module-lesson-type">{LESSON_TYPE_ABBREV[lesson.LessonType]}</span>
          <span className="cell-module-class">{' '}[{lesson.ClassNo}]</span>
        </div>
        <div><span className="cell-module-venue">{lesson.Venue}</span></div>
      </div>
    );
  }

  return <span className="timetable-cell" style={style}>{cell}</span>;
}

export default TimetableCell;
