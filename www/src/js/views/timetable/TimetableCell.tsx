import * as React from 'react';
import classnames from 'classnames';
import { isEqual } from 'lodash';
import { format, parseISO } from 'date-fns';

import { consumeWeeks, ModifiableLesson } from 'types/modules';
import { HoverLesson } from 'types/timetables';
import { OnHoverCell } from 'types/views';

import { formatNumericWeeks, getHoverLesson, LESSON_TYPE_ABBREV } from 'utils/timetables';
import elements from 'views/elements';

import styles from './TimetableCell.scss';

type Props = {
  showTitle: boolean;
  lesson: ModifiableLesson;
  onHover: OnHoverCell;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverLesson?: HoverLesson | null;
};

function formatWeekRange(start: string, end: string) {
  if (start === end) return format(parseISO(start), 'MMM dd');
  return `${format(parseISO(start), 'MMM dd')}–${format(parseISO(end), 'MMM dd')}`;
}

/**
 * Smallest unit in timetable.
 * Representing a lesson in this case. In future we
 * might explore other representations e.g. grouped lessons
 */
function TimetableCell(props: Props) {
  const { lesson, showTitle, onClick, onHover, hoverLesson } = props;

  const moduleName = showTitle ? `${lesson.ModuleCode} ${lesson.ModuleTitle}` : lesson.ModuleCode;
  const Cell = props.onClick ? 'button' : 'div';
  const hover = isEqual(getHoverLesson(lesson), hoverLesson);

  const conditionalProps = onClick
    ? {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          onClick();
        },
      }
    : {};

  const weekText = consumeWeeks(lesson.Weeks, formatNumericWeeks, (weekRange) =>
    formatWeekRange(weekRange.start, weekRange.end),
  );

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
      onMouseEnter={() => onHover(getHoverLesson(lesson))}
      onTouchStart={() => onHover(getHoverLesson(lesson))}
      onMouseLeave={() => onHover(null)}
      onTouchEnd={() => onHover(null)}
      {...conditionalProps}
    >
      <div className={styles.cellContainer}>
        <div className={styles.moduleName}>{moduleName}</div>
        <div>
          {LESSON_TYPE_ABBREV[lesson.LessonType]} [{lesson.ClassNo}]
        </div>
        <div>{lesson.Venue}</div>
        {weekText && <div>{weekText}</div>}
      </div>
    </Cell>
  );
}

export default TimetableCell;
