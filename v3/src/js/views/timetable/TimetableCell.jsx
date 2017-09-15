// @flow
import React from 'react';
import classnames from 'classnames';

import type { Lesson } from 'types/modules';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';

import styles from './TimetableCell.scss';

type Props = {
  lesson: Lesson,
  style: Object,
  onModifyCell: Function,
};

function TimetableCell(props: Props) {
  const lesson = props.lesson;
  return (
    <button
      className={classnames(styles.cell, {
        // $FlowFixMe When object spread type actually works
        [styles.cellIsModifiable]: lesson.isModifiable,
        // $FlowFixMe When object spread type actually works
        [styles.cellIsAvailable]: lesson.isAvailable,
        // $FlowFixMe When object spread type actually works
        [styles.cellIsActive]: lesson.isActive,
        // $FlowFixMe When object spread type actually works
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
      <div className={styles.cellContainer}>
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
      </div>
    </button>
  );
}

export default TimetableCell;
