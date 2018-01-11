// @flow
import React from 'react';
import classnames from 'classnames';

import type { ModifiableLesson } from 'types/modules';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';

import styles from './TimetableCell.scss';

type Props = {
  isScrolledHorizontally: boolean,
  showTitle: boolean,
  lesson: ModifiableLesson,
  style: Object,
  onClick?: Function,
};

/**
 * Smallest unit in timetable.
 * Representing a lesson in this case. In future we
 * might explore other representations e.g. grouped lessons
 */
function TimetableCell(props: Props) {
  const { lesson, showTitle, onClick } = props;

  const moduleName = showTitle ? `${lesson.ModuleCode} ${lesson.ModuleTitle}` : lesson.ModuleCode;

  const Cell = props.onClick ? 'button' : 'div';
  return (
    <Cell
      className={classnames(styles.cell, `color-${lesson.colorIndex}`, {
        [styles.cellIsClickable]: !!onClick,
        [styles.cellIsAvailable]: lesson.isAvailable,
        [styles.cellIsActive]: lesson.isActive,
        [styles.cellIsActiveScrolled]: props.isScrolledHorizontally,
      })}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(lesson);
      }}
      style={props.style}
    >
      <div className={styles.cellContainer}>
        <div className={styles.moduleName}>{moduleName}</div>
        <div>
          {LESSON_TYPE_ABBREV[lesson.LessonType]} [{lesson.ClassNo}]
        </div>
        <div>{lesson.Venue}</div>
        {lesson.WeekText !== 'Every Week' && <div>{lesson.WeekText}</div>}
      </div>
    </Cell>
  );
}

export default TimetableCell;
