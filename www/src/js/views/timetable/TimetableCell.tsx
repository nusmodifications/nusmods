import * as React from 'react';
import classnames from 'classnames';
import { isEqual } from 'lodash';

import { Lesson } from 'types/modules';
import { HoverLesson } from 'types/timetables';

import { formatWeekNumber, getHoverLesson, LESSON_TYPE_ABBREV } from 'utils/timetables';
import elements from 'views/elements';

import styles from './TimetableCell.scss';

type Props = {
  showTitle: boolean;
  lesson: Lesson;
  style?: Object;
  onClick?: Function;
  onHover?: (hoverLesson?: HoverLesson) => void;
  hoverLesson: HoverLesson | null | undefined;
};

/**
 * Smallest unit in timetable.
 * Representing a lesson in this case. In future we
 * might explore other representations e.g. grouped lessons
 */
function TimetableCell(props: Props) {
  const { lesson, showTitle, onClick, onHover, hoverLesson } = props;

  const moduleName = showTitle ? `${lesson.ModuleCode} ${lesson.ModuleTitle}` : lesson.ModuleCode;
  const conditionalProps = { onClick };

  const Cell = props.onClick ? 'button' : 'div';
  const hover = isEqual(getHoverLesson(lesson), hoverLesson);

  /* eslint-disable */
  return (
    <Cell
      className={classnames(styles.cell, elements.lessons, `color-${lesson.colorIndex}`, {
        hoverable: !!props.onClick,
        [styles.clickable]: !!onClick,
        [styles.available]: lesson.isAvailable,
        [styles.active]: lesson.isActive,
        // Local hover style for the timetable planner timetable,
        [styles.hover]: hover,
        // Global hover style for module page timetable
        hover,
      })}
      style={props.style}
      onMouseEnter={() => onHover && onHover(getHoverLesson(lesson))}
      onTouchStart={() => onHover && onHover(getHoverLesson(lesson))}
      onMouseLeave={() => onHover && onHover(null)}
      onTouchEnd={() => onHover && onHover(null)}
      {...conditionalProps}
    >
      <div className={styles.cellContainer}>
        <div className={styles.moduleName}>{moduleName}</div>
        <div>
          {LESSON_TYPE_ABBREV[lesson.LessonType]} [{lesson.ClassNo}]
        </div>
        <div>{lesson.Venue}</div>
        {lesson.WeekText !== 'Every Week' && <div>{formatWeekNumber(lesson.WeekText)}</div>}
      </div>
    </Cell>
  );
}

export default TimetableCell;
