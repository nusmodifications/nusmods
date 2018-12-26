// @flow
import React from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';

import type { ColoredLesson } from 'types/modules';
import type { HoverLesson } from 'types/timetables';

import { convertTimeToIndex } from 'utils/timify';
import { getLessonKey } from 'utils/timetables';
import styles from './TimetableRow.scss';
import TimetableCell from './TimetableCell';

type Props = {
  verticalMode: boolean,
  showTitle: boolean,
  flipKey: string,
  hoverLesson: ?HoverLesson,
  onCellHover: ?(?HoverLesson) => void,
  startingIndex: number,
  endingIndex: number,
  lessons: ColoredLesson[],
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
    <Flipper flipKey={props.flipKey} className={styles.timetableRow}>
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
        // $FlowFixMe
        const conditionalProps = lesson.isModifiable
          ? {
              onClick: (e: Event) => {
                e.stopPropagation();
                return onModifyCell(lesson);
              },
            }
          : {};

        return (
          <Flipped flipId={getLessonKey(lesson)} key={getLessonKey(lesson)}>
            {(flipProps) => (
              <TimetableCell
                style={style}
                lesson={lesson}
                showTitle={props.showTitle}
                hoverLesson={props.hoverLesson}
                onHover={props.onCellHover}
                flipProps={flipProps}
                {...conditionalProps}
              />
            )}
          </Flipped>
        );
      })}
    </Flipper>
  );
}

export default TimetableRow;
