// @flow
import React from 'react';

import type { Lesson } from 'types/modules';

import {
  convertTimeToIndex,
  getCurrentSingaporeHours,
  getCurrentSingaporeMinutes,
} from 'utils/timify';
import styles from './TimetableRow.scss';
import TimetableCell from './TimetableCell';
import CurrentTimeIndicator from './CurrentTimeIndicator';

type Props = {
  isCurrentDay: boolean,
  verticalMode: boolean,
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

  // Calculate the margin offset for the CurrentTimeIndicator
  const currentHours = getCurrentSingaporeHours();
  const currentMinutes = getCurrentSingaporeMinutes();
  const hoursMarginOffset = (currentHours * 2 - startingIndex) / totalCols * 100;
  const minutesMarginOffset = currentMinutes / 30 / totalCols * 100;
  const timeIndicatorIsVisible =
    currentHours * 2 >= startingIndex && currentHours * 2 < endingIndex;

  const currentTimeIndicatorStyle: Object = {
    [dirStyle]: `${hoursMarginOffset + minutesMarginOffset}%`,
  };

  let lastStartIndex = startingIndex;
  return (
    <div className={styles.timetableRow}>
      {props.isCurrentDay &&
        timeIndicatorIsVisible && <CurrentTimeIndicator style={currentTimeIndicatorStyle} />}
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
        // $FlowFixMe When object spread type actually works
        const conditionalProps = lesson.isModifiable ? { onModifyCell } : {};
        return (
          <TimetableCell
            key={lesson.StartTime}
            style={style}
            lesson={lesson}
            {...conditionalProps}
          />
        );
      })}
    </div>
  );
}

export default TimetableRow;
