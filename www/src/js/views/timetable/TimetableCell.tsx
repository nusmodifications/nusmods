import * as React from 'react';
import classnames from 'classnames';
import { isEqual } from 'lodash';

import { ModifiableLesson } from 'types/modules';
import { HoverLesson } from 'types/timetables';
import { OnHoverCell } from 'types/views';

import { formatWeekNumber, getHoverLesson, LESSON_TYPE_ABBREV } from 'utils/timetables';
import { maintainScrollPosition } from 'utils/react';
import elements from 'views/elements';

import styles from './TimetableCell.scss';

type Props = {
  showTitle: boolean;
  lesson: ModifiableLesson;
  onHover: OnHoverCell;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverLesson?: HoverLesson | null;
  verticalMode?: boolean;
  timetableScrollContainerRef?: React.RefObject<HTMLDivElement>;
};

type State = {
  positionBeforeUpdate: DOMRect | null;
  lessonID: string | null;
};

/**
 * Smallest unit in timetable.
 * Representing a lesson in this case. In future we
 * might explore other representations e.g. grouped lessons
 */
class TimetableCell extends React.Component<Props, State> {
  state: State = {
    positionBeforeUpdate: null,
    lessonID: null,
  };

  componentDidUpdate() {
    if (this.state.positionBeforeUpdate) {
      this.maintainScrollPosition();
    }
  }

  maintainScrollPosition() {
    // Destructure vars
    const { positionBeforeUpdate, lessonID } = this.state;
    const { verticalMode, timetableScrollContainerRef } = this.props;

    if (!positionBeforeUpdate || !lessonID || !timetableScrollContainerRef) return;

    // Get elements
    const lessonElement = document.getElementById(lessonID);
    const timetableScrollContainer = timetableScrollContainerRef.current;

    if (!lessonElement || !timetableScrollContainer) return;

    // Get position after update
    const positionAfterUpdate = lessonElement.getBoundingClientRect() as DOMRect;

    // Call for scroll
    maintainScrollPosition(
      positionBeforeUpdate,
      positionAfterUpdate,
      timetableScrollContainer,
      verticalMode,
    );

    // Unset saved attributes
    this.setState({
      positionBeforeUpdate: null,
      lessonID: null,
    });
  }

  handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Save attributes before update
    if (e.currentTarget) {
      this.setState({
        positionBeforeUpdate: e.currentTarget.getBoundingClientRect() as DOMRect,
        lessonID: e.currentTarget.id,
      });
    }

    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  render() {
    const { lesson, showTitle, onClick, onHover, hoverLesson } = this.props;

    const moduleName = showTitle ? `${lesson.ModuleCode} ${lesson.ModuleTitle}` : lesson.ModuleCode;
    const Cell = this.props.onClick ? 'button' : 'div';
    const hover = isEqual(getHoverLesson(lesson), hoverLesson);

    const conditionalProps = onClick ? { onClick: this.handleClick } : {};

    /* eslint-disable */
    return (
      <Cell
        className={classnames(styles.cell, elements.lessons, `color-${lesson.colorIndex}`, {
          hoverable: !!this.props.onClick,
          [styles.clickable]: !!onClick,
          [styles.available]: lesson.isAvailable,
          [styles.active]: lesson.isActive,
          // Local hover style for the timetable planner timetable,
          [styles.hover]: hover,
          // Global hover style for module page timetable
          hover,
        })}
        style={this.props.style}
        id={`${lesson.ModuleCode}-${LESSON_TYPE_ABBREV[lesson.LessonType]}-${lesson.ClassNo}`}
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
          {lesson.WeekText !== 'Every Week' && <div>{formatWeekNumber(lesson.WeekText)}</div>}
        </div>
      </Cell>
    );
  }
}

export default TimetableCell;
