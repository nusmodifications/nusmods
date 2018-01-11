// @flow
import React from 'react';

import type { Lesson } from 'types/modules';

import { convertTimeToIndex } from 'utils/timify';
import styles from './TimetableRow.scss';
import TimetableCell from './TimetableCell';

type Props = {
  verticalMode: boolean,
  showTitle: boolean,
  isScrolledHorizontally: boolean,
  startingIndex: number,
  endingIndex: number,
  lessons: Array<Lesson>,
  onModifyCell: Function,
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
 *
 * @param {Props} props
 * @returns
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
          [dirStyle]: `calc(${dirValue / totalCols * 100}% + 1px)`,
          [sizeStyle]: `calc(${size / totalCols * 100}% - 1px)`,
        };
        // $FlowFixMe
        const conditionalProps = lesson.isModifiable ? { onClick: onModifyCell } : {};
        return (
          <TimetableCell
            key={lesson.StartTime}
            style={style}
            lesson={lesson}
            isScrolledHorizontally={props.isScrolledHorizontally}
            showTitle={props.showTitle}
            {...conditionalProps}
          />
        );
      })}
    </div>
  );
}

export default TimetableRow;
