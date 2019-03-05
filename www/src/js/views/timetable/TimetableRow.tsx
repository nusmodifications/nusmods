import * as React from 'react';

import { ModifiableLesson } from 'types/modules';
import { HoverLesson } from 'types/timetables';
import { OnHoverCell, OnModifyCell } from 'types/views';

import { convertTimeToIndex } from 'utils/timify';
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

  let lastStartIndex = startingIndex;

  return (
    <div className={styles.timetableRow}>
      {lessons.map((lesson) => {
        const startIndex = convertTimeToIndex(lesson.StartTime);
        const endIndex = convertTimeToIndex(lesson.EndTime);
        const size = endIndex - startIndex;

        const dirStyle = verticalMode ? 'top' : 'marginLeft';
        const sizeStyle = verticalMode ? 'height' : 'width';

        const dirValue = startIndex - (verticalMode ? startingIndex : lastStartIndex);
        const style = {
          // calc() adds a 1px gap between cells
          [dirStyle]: `calc(${(dirValue / totalCols) * 100}% + 1px)`,
          [sizeStyle]: `calc(${(size / totalCols) * 100}% - 1px)`,
        };

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
