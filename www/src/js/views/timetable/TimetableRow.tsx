import * as React from 'react';

import { ModifiableLesson } from 'types/modules';
import { HoverLesson } from 'types/timetables';
import { OnHoverCell, OnModifyCell, MaintainScrollPosition } from 'types/views';

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
  maintainScrollPosition?: MaintainScrollPosition;
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
  return (
    <div className={styles.timetableRow}>
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
            maintainScrollPosition={props.maintainScrollPosition}
            {...conditionalProps}
          />
        );
      })}
    </div>
  );
}

export default TimetableRow;
