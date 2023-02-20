import * as React from 'react';
import classnames from 'classnames';
import { isEqual } from 'lodash';
import { addWeeks, format, parseISO } from 'date-fns';
import NUSModerator, { AcadWeekInfo } from 'nusmoderator';

import { consumeWeeks, ModuleCode, WeekRange } from 'types/modules';
import { HoverLesson, ModifiableLesson } from 'types/timetables';
import { OnHoverCell } from 'types/views';

import {
  formatNumericWeeks,
  getHoverLesson,
  getLessonIdentifier,
  LESSON_TYPE_ABBREV,
} from 'utils/timetables';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip/Tooltip';
import styles from './TimetableCell.scss';

type Props = {
  showTitle: boolean;
  lesson: ModifiableLesson;
  onHover: OnHoverCell;
  style?: React.CSSProperties;
  onClick?: (position: ClientRect) => void;
  hoverLesson?: HoverLesson | null;
  transparent: boolean;
  customisedModules?: ModuleCode[];
};

const lessonDateFormat = 'MMM dd';

function formatWeekInfo(weekInfo: AcadWeekInfo) {
  if (weekInfo.type === 'Instructional') return `Week ${weekInfo.num}`;
  return weekInfo.type;
}

function formatWeekRange(weekRange: WeekRange) {
  const start = parseISO(weekRange.start);

  // Start = end means there's just one lesson
  if (weekRange.start === weekRange.end) return format(start, lessonDateFormat);

  let dateRange = `${format(start, lessonDateFormat)}–${format(
    parseISO(weekRange.end),
    lessonDateFormat,
  )}`;

  // If lessons are not weekly, we need to mention that
  if (weekRange.weekInterval) {
    dateRange += `, every ${weekRange.weekInterval} weeks`;
  }

  if (!weekRange.weeks) return dateRange;

  // If the weeks are uneven (ie. there are gaps), we need to use a full table
  // to show all the dates the lesson is on
  const table = (
    <div className={styles.classes}>
      <h5>Classes</h5>
      <ol className={classnames({ [styles.twoColumn]: weekRange.weeks.length > 6 })}>
        {weekRange.weeks.map((week) => {
          const date = addWeeks(start, week - 1);
          const weekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(date);
          return (
            <li key={week}>
              {format(date, lessonDateFormat)}{' '}
              <span className={styles.weekInfo}>({formatWeekInfo(weekInfo)})</span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <Tooltip content={table} interactive arrow>
      <span className={styles.weeksSpecial}>{dateRange}</span>
    </Tooltip>
  );
}

/**
 * Smallest unit in timetable.
 * Representing a lesson in this case. In future we
 * might explore other representations e.g. grouped lessons
 */
const TimetableCell: React.FC<Props> = (props) => {
  const { lesson, showTitle, onClick, onHover, hoverLesson, transparent } = props;

  const moduleName = showTitle ? `${lesson.moduleCode} ${lesson.title}` : lesson.moduleCode;
  const Cell = props.onClick ? 'button' : 'div';
  const isHoveredOver = isEqual(getHoverLesson(lesson), hoverLesson);

  const conditionalProps = onClick
    ? {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          onClick(e.currentTarget.getBoundingClientRect());
        },
      }
    : {};

  const weekText = consumeWeeks<React.ReactNode>(lesson.weeks, formatNumericWeeks, formatWeekRange);

  const className = classnames(
    styles.baseCell,
    getLessonIdentifier(lesson),
    elements.lessons,
    transparent ? styles.transparentCell : [styles.coloredCell, `color-${lesson.colorIndex}`],
    {
      hoverable: !!onClick,
      [styles.clickable]: !!onClick,
      [styles.available]: lesson.isAvailable,
      [styles.active]: lesson.isActive,
      // Local hover style for the timetable planner timetable,
      [styles.hover]: isHoveredOver,
      // Global hover style for module page timetable
      hover: isHoveredOver,
    },
  );

  return (
    <Cell
      className={className}
      style={props.style}
      onMouseEnter={() => onHover(getHoverLesson(lesson))}
      onTouchStart={() => onHover(getHoverLesson(lesson))}
      onMouseLeave={() => onHover(null)}
      onTouchEnd={() => onHover(null)}
      {...conditionalProps}
    >
      <div className={styles.cellContainer}>
        <div className={styles.moduleName}>{moduleName}{props.customisedModules && props.customisedModules.includes(lesson.moduleCode)?'*':null}</div>
        <div>
          {LESSON_TYPE_ABBREV[lesson.lessonType]} [{lesson.classNo}]
        </div>
        <div>{lesson.venue.startsWith('E-Learn') ? 'E-Learning' : lesson.venue}</div>
        {weekText && <div>{weekText}</div>}
      </div>
    </Cell>
  );
};

export default TimetableCell;
