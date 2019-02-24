import * as React from 'react';

import { ModifiableLesson } from 'types/modules';
import { HoverLesson } from 'types/timetables';
import { OnHoverCell, OnModifyCell } from 'types/views';

import { convertTimeToIndex } from 'utils/timify';
import { ColoredTimePeriod, createGenericColoredTimePeriod } from '../../types/timePeriod';
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
  highlightPeriod?: ColoredTimePeriod;
};

function getHighlightPeriod(period?: ColoredTimePeriod): ColoredTimePeriod {
  if (period !== undefined) {
    return period;
  }

  return createGenericColoredTimePeriod();
}

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

  function getHighlightStyle(period: ColoredTimePeriod) {
    const periodStartIndex: number = convertTimeToIndex(period.StartTime);
    const periodEndIndex: number = convertTimeToIndex(period.EndTime);
    const periodSize: number = periodEndIndex - periodStartIndex;
    const periodDirValue: number = periodStartIndex - (verticalMode ? startingIndex : lastStartIndex);
    return {
      // calc() adds a 1px gap between cells
      [dirStyle]: `calc(${(periodDirValue / totalCols) * 100}% + 1px)`,
      [sizeStyle]: `calc(${(periodSize / totalCols) * 100}% - 1px)`,
    };
  }
  
  const period = getHighlightPeriod(props.highlightPeriod);
  const highlightStyle = getHighlightStyle(period);

  return (
    <div className={styles.timetableRow}>
      {props.highlightPeriod !== undefined
        ? <TimetableHighlight key="highlightPeriod" highlightPeriod={props.highlightPeriod} style={highlightStyle} />
        : null}
      {lessons.map((lesson) => {
        const lessonStartIndex: number = convertTimeToIndex(lesson.StartTime);
        const lessonEndIndex: number = convertTimeToIndex(lesson.EndTime);
        const size: number = lessonEndIndex - lessonStartIndex;

        const dirValue: number = lessonStartIndex - (verticalMode ? startingIndex : lastStartIndex);
        lastStartIndex = lessonEndIndex;
        const style = {
          // calc() adds a 1px gap between cells
          [dirStyle]: `calc(${(dirValue / totalCols) * 100}% + 1px)`,
          [sizeStyle]: `calc(${(size / totalCols) * 100}% - 1px)`,
        };
        const conditionalProps =
          lesson.isModifiable && onModifyCell
            ? {
                onClick: () => {
                  onModifyCell(lesson);
                },
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
