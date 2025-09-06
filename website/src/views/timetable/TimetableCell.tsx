import * as React from 'react';
import classnames from 'classnames';
import { noop } from 'lodash';
import { addWeeks, format, parseISO } from 'date-fns';
import NUSModerator, { AcadWeekInfo } from 'nusmoderator';

import { consumeWeeks, WeekRange } from 'types/modules';
import { ColoredLesson, HoverLesson, InteractableLesson } from 'types/timetables';
import { OnHoverCell } from 'types/views';

import {
  formatNumericWeeks,
  getHoverLesson,
  getLessonIdentifier,
  isInteractable,
  LESSON_TYPE_ABBREV,
} from 'utils/timetables';
import { TRANSPARENT_COLOR_INDEX } from 'utils/colors';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip/Tooltip';
import { Minus, Plus } from 'react-feather';
import styles from './TimetableCell.scss';

type Props = {
  showTitle: boolean;
  lesson: ColoredLesson;
  onHover: OnHoverCell;
  style?: React.CSSProperties;
  onClick?: (position: ClientRect) => void;
  hoverLesson?: HoverLesson | null;
  transparent: boolean;
};

const lessonDateFormat = 'MMM dd';

function formatWeekInfo(weekInfo: AcadWeekInfo) {
  if (weekInfo.type === 'Instructional') return `Week ${weekInfo.num}`;
  return weekInfo.type;
}

/**
 * Determines if the lesson should be highlighted as part of the same lesson group as the lesson currently being hovered over
 * @param lesson This cell's lesson
 * @param hoverLesson The lesson being hovered over
 */
function checkHover(
  lesson: InteractableLesson | ColoredLesson,
  hoverLesson: HoverLesson | null | undefined,
): boolean {
  if (!hoverLesson) return false;

  if (!isInteractable(lesson)) return false;

  if (lesson.moduleCode !== hoverLesson.moduleCode || lesson.lessonType !== hoverLesson.lessonType)
    return false;

  if (!lesson.isTaInTimetable && lesson.classNo === hoverLesson.classNo) return true;

  if (lesson.isTaInTimetable && lesson.lessonIndex === hoverLesson.lessonIndex) return true;

  return false;
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
  const isHoveredOver = checkHover(lesson, hoverLesson);

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
    transparent || lesson.colorIndex === TRANSPARENT_COLOR_INDEX
      ? styles.transparentCell
      : [styles.coloredCell, `color-${lesson.colorIndex}`],
    {
      hoverable: !!onClick,
      [styles.clickable]: !!onClick,
      [styles.available]: isInteractable(lesson) && lesson.canBeAddedToLessonConfig,
      [styles.active]: isInteractable(lesson) && lesson.isActive,
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
      onMouseEnter={isInteractable(lesson) ? () => onHover(getHoverLesson(lesson)) : noop}
      onTouchStart={isInteractable(lesson) ? () => onHover(getHoverLesson(lesson)) : noop}
      onMouseLeave={() => onHover(null)}
      onTouchEnd={() => onHover(null)}
      autoFocus={isInteractable(lesson) && lesson.isActive}
      {...conditionalProps}
    >
      <div className={styles.cellContainer}>
        <div className={styles.cellHeaader}>
          <div className={styles.moduleName}>
            {moduleName}
            {isInteractable(lesson) && lesson.isTaInTimetable && ' (TA)'}
          </div>

          {isInteractable(lesson) &&
            lesson.isTaInTimetable &&
            onClick &&
            isHoveredOver &&
            hoverLesson &&
            (lesson.isActive || !lesson.canBeAddedToLessonConfig ? (
              <Minus className={styles.taActionIndicator} />
            ) : (
              <Plus className={styles.taActionIndicator} />
            ))}
        </div>
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
