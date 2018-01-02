// @flow
import React from 'react';
import classnames from 'classnames';

import type { Lesson } from 'types/modules';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';

import styles from './TimetableCell.scss';

type Props = {
  lesson: Lesson,
  style: Object,
  isScrolledHorizontally: boolean,
  onModifyCell?: Function,
};

function TimetableCell(props: Props) {
  const lesson = props.lesson;
  return (
    <button
      // $FlowFixMe When object spread type actually works
      className={classnames(styles.cell, `color-${lesson.colorIndex}`, {
        // $FlowFixMe When object spread type actually works
        [styles.cellIsModifiable]: lesson.isModifiable,
        // $FlowFixMe When object spread type actually works
        [styles.cellIsAvailable]: lesson.isAvailable,
        // $FlowFixMe When object spread type actually works
        [styles.cellIsActive]: lesson.isActive,
        // $FlowFixMe When object spread type actually works
        [styles.cellIsActiveScrolled]: lesson.isActive && props.isScrolledHorizontally,
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
        <div className={styles.moduleCode}>{lesson.ModuleCode}</div>
        <div>
          {LESSON_TYPE_ABBREV[lesson.LessonType]} [{lesson.ClassNo}]
        </div>
        <div>{lesson.Venue}</div>
        {lesson.WeekText !== 'Every Week' && <div>{lesson.WeekText}</div>}
      </div>
    </button>
  );
}

export default TimetableCell;
