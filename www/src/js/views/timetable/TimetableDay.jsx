// @flow
import React from 'react';
import classnames from 'classnames';

import type { TimetableDayArrangement, HoverLesson } from 'types/timetables';

import { convertTimeToIndex, DEFAULT_EARLIEST_TIME } from 'utils/timify';
import styles from './TimetableDay.scss';
import TimetableRow from './TimetableRow';
import CurrentTimeIndicator from './CurrentTimeIndicator';

type Props = {
  day: string,
  dayLessonRows: TimetableDayArrangement,
  verticalMode: boolean,
  showTitle: boolean,
  isScrolledHorizontally: boolean,
  startingIndex: number,
  endingIndex: number,
  onModifyCell: Function,
  isCurrentDay: boolean,
  currentTimeIndicatorStyle: Object,
  hoverLesson: ?HoverLesson,
  onCellHover: ?(?HoverLesson) => void,
};

// Height of timetable per hour in vertical mode
const VERTICAL_HEIGHT = 2.4;

function TimetableDay(props: Props) {
  const columns = props.endingIndex - props.startingIndex;
  const size = 100 / (columns / 4);
  // We need to offset background position when classes before 10am are inserted
  // so that it will appear as if the cells are inserted in front, and not behind
  // the timetable.
  // Background position uses the gap between the bg and the edge, so we
  // need this number
  // See: https://drafts.csswg.org/css-backgrounds-3/#valdef-background-position-percentage
  const bgOffsetUnits = (convertTimeToIndex(DEFAULT_EARLIEST_TIME) - props.startingIndex) / 4;
  const bgOffset = bgOffsetUnits * ((100 * size) / (100 - size));

  const rowStyle: Object = {
    // Firefox defaults the second value (width) to auto if not specified
    backgroundSize: `${size}% 100%`,
    backgroundPosition: `left ${bgOffset}% top`,
  };

  if (props.verticalMode) rowStyle.height = `${VERTICAL_HEIGHT * columns}rem`;

  return (
    <li className={styles.day}>
      <div
        className={classnames(styles.dayName, {
          [styles.dayNameScrolled]: props.isScrolledHorizontally,
        })}
      >
        <span className={styles.dayNameText}>{props.day.substring(0, 3)}</span>
      </div>
      <div className={styles.dayRows} style={rowStyle}>
        <CurrentTimeIndicator style={props.currentTimeIndicatorStyle} />

        {props.dayLessonRows.map((dayLessonRow, i) => (
          <TimetableRow
            key={i}
            startingIndex={props.startingIndex}
            endingIndex={props.endingIndex}
            verticalMode={props.verticalMode}
            showTitle={props.showTitle}
            lessons={dayLessonRow}
            onModifyCell={props.onModifyCell}
            hoverLesson={props.hoverLesson}
            onCellHover={props.onCellHover}
          />
        ))}
      </div>
      {props.isCurrentDay && <div className={classnames('no-export', styles.currentDay)} />}
    </li>
  );
}

export default TimetableDay;
