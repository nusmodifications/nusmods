import * as React from 'react';

import { EndTime, ModifiableLesson, StartTime } from 'types/modules';
import { HoverLesson } from 'types/timetables';
import { OnHoverCell, OnModifyCell } from 'types/views';

import { convertTimeToIndex } from 'utils/timify';
import { TimePeriod } from 'types/timePeriod';
import TimetableHighlight from './TimetableHighlight';
import styles from './TimetableRow.scss';
import TimetableCell from './TimetableCell';

type Props = {
  verticalMode: boolean;
  showTitle: boolean;
  startingIndex: number;
  endingIndex: number;
  lessons: ModifiableLesson[];
  hoverLesson?: HoverLesson | null;
  onCellHover: OnHoverCell;
  onModifyCell?: OnModifyCell;
  highlightPeriod?: TimePeriod;
};

/**
 * Position the lessons properly on the row.
 * In horizontal mode, we use margin to insert space for elements,
 * which are relative to each other.
 * In vertical mode, we use absolute positioning to place lessons
 * relative to the parent.
 *
 * Reasoning for doing so is that we need rows to resize according to their
 * children's height, in which absolute positioning would not allow.
 */
function TimetableRow(props: Props) {
  const { startingIndex, endingIndex, lessons, onModifyCell, verticalMode } = props;
  const totalCols = endingIndex - startingIndex;
  const dirStyle = verticalMode ? 'top' : 'marginLeft';
  const sizeStyle = verticalMode ? 'height' : 'width';

  let lastStartIndex = startingIndex;

  /**
   * Return direction and size style for the TimetableCell or TimetableHighlight to be displayed.
   *
   * @param startTime Start time of the lesson/highlight period
   * @param endTime End time of the lesson/highlight period
   */
  function getElementStyle(startTime: StartTime, endTime: EndTime) {
    const startIndex: number = convertTimeToIndex(startTime);
    const endIndex: number = convertTimeToIndex(endTime);
    const size: number = endIndex - startIndex;

    const dirValue: number = startIndex - (verticalMode ? startingIndex : lastStartIndex);
    const style = {
      // calc() adds a 1px gap between cells
      [dirStyle]: `calc(${(dirValue / totalCols) * 100}% + 1px)`,
      [sizeStyle]: `calc(${(size / totalCols) * 100}% - 1px)`,
    };

    return style;
  }

  function getHighlightStyle(period?: TimePeriod) {
    if (period !== undefined) {
      return getElementStyle(period.StartTime, period.EndTime);
    }
    return undefined;
  }

  const highlightStyle = getHighlightStyle(props.highlightPeriod);

  return (
    <div className={styles.timetableRow}>
      {props.highlightPeriod !== undefined ? (
        <TimetableHighlight key="highlightPeriod" style={highlightStyle} />
      ) : null}
      {lessons.map((lesson) => {
        const style = getElementStyle(lesson.StartTime, lesson.EndTime);
        lastStartIndex = convertTimeToIndex(lesson.EndTime);

        const conditionalProps =
          lesson.isModifiable && onModifyCell
            ? {
                onClick: (position: ClientRect) => onModifyCell(lesson, position),
              }
            : {};

        return (
          <TimetableCell
            key={lesson.StartTime}
            style={style}
            lesson={lesson}
            showTitle={props.showTitle}
            hoverLesson={props.hoverLesson}
            onHover={props.onCellHover}
            {...conditionalProps}
          />
        );
      })}
    </div>
  );
}

export default TimetableRow;
