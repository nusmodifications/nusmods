// @flow
import React from 'react';
import classnames from 'classnames';

import type { ModifiableLesson } from 'types/modules';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';

import styles from './TimetableCell.scss';

type Props = {
  lesson: ModifiableLesson,
  style: Object,
  onModifyCell: Function,
};

function TimetableCell(props: Props) {
  const lesson = props.lesson;
  return (
    <button
      className={classnames(styles.cell, {
        [styles.cellIsModifiable]: lesson.isModifiable,
        [styles.cellIsAvailable]: lesson.isAvailable,
        [styles.cellIsActive]: lesson.isActive,
        [`color-${lesson.colorIndex}`]: true,
      })}
      onClick={(event) => {
        event.stopPropagation();
        if (props.onModifyCell) {
          props.onModifyCell(lesson);
        }
      }}
      style={props.style}
    >
      <div className={styles.moduleCode}>
        {lesson.ModuleCode}
      </div>
      <div>
        <span>
          {LESSON_TYPE_ABBREV[lesson.LessonType]}
        </span>
        <span>
          {' '}[{lesson.ClassNo}]
        </span>
      </div>
      <div>
        <span>
          {lesson.Venue}
        </span>
      </div>
    </button>
  );
}

export default TimetableCell;
