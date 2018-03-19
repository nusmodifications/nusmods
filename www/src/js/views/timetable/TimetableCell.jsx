// @flow
import React from 'react';
import classnames from 'classnames';

import type { Lesson } from 'types/modules';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';

import styles from './TimetableCell.scss';

type Props = {
  showTitle: boolean,
  lesson: Lesson,
  style?: Object,
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
  const conditionalProps = { onClick };

  const Cell = props.onClick ? 'button' : 'div';
  return (
    <Cell // $FlowFixMe
      className={classnames(styles.cell, `color-${lesson.colorIndex}`, {
        hoverable: !!props.onClick,
        [styles.cellIsClickable]: !!onClick,
        // $FlowFixMe
        [styles.cellIsAvailable]: lesson.isAvailable,
        // $FlowFixMe
        [styles.cellIsActive]: lesson.isActive,
      })}
      style={props.style}
      {...conditionalProps}
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
