import * as React from 'react';

import { HoverLesson, ModifiableLesson } from 'types/timetables';
import { OnHoverCell, OnModifyCell } from 'types/views';

import { convertTimeToIndex } from 'utils/timify';
import styles from './TimetableRow.scss';
import TimetableCell from './TimetableCell';
import { ModuleCode } from 'types/modules';

type Props = {
  verticalMode: boolean;
  showTitle: boolean;
  startingIndex: number;
  endingIndex: number;
  lessons: ModifiableLesson[];
  hoverLesson?: HoverLesson | null;
  onCellHover: OnHoverCell;
  onModifyCell?: OnModifyCell;
  customisedModules?: ModuleCode[];
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
const TimetableRow: React.FC<Props> = (props) => {
  const { startingIndex, endingIndex, lessons, onModifyCell, verticalMode } = props;
  const totalCols = endingIndex - startingIndex;

  let lastStartIndex = startingIndex;

  return (
    <div className={styles.timetableRow}>
      {lessons.map((lesson) => {
        const startIndex = convertTimeToIndex(lesson.startTime);
        const endIndex = convertTimeToIndex(lesson.endTime);

        const size = endIndex - startIndex;

        const dirStyle = verticalMode ? 'top' : 'marginLeft';
        const sizeStyle = verticalMode ? 'height' : 'width';

        const dirValue = startIndex - (verticalMode ? startingIndex : lastStartIndex);
        const style = {
          // calc() adds a 1px gap between cells
          [dirStyle]: `calc(${(dirValue / totalCols) * 100}% + 1px)`,
          [sizeStyle]: `calc(${(size / totalCols) * 100}% - 1px)`,
        };

        lastStartIndex = endIndex;

        const conditionalProps =
          lesson.isModifiable && onModifyCell
            ? {
                onClick: (position: ClientRect) => onModifyCell(lesson, position),
              }
            : {};

        return (
          <TimetableCell
            key={lesson.startTime}
            style={style}
            lesson={lesson}
            showTitle={props.showTitle}
            hoverLesson={props.hoverLesson}
            onHover={props.onCellHover}
            transparent={lesson.startTime === lesson.endTime}
            customisedModules={props.customisedModules}
            {...conditionalProps}
          />
        );
      })}
    </div>
  );
};

export default TimetableRow;
