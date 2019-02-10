import * as React from 'react';
import classnames from 'classnames';

import { TimetableDayArrangement, HoverLesson } from 'types/timetables';

import styles from './TimetableDay.scss';
import TimetableRow from './TimetableRow';
import CurrentTimeIndicator from './CurrentTimeIndicator';

type Props = {
  day: string;
  dayLessonRows: TimetableDayArrangement;
  verticalMode: boolean;
  showTitle: boolean;
  isScrolledHorizontally: boolean;
  startingIndex: number;
  endingIndex: number;
  onModifyCell: Function;
  isCurrentDay: boolean;
  currentTimeIndicatorStyle: Object;
  hoverLesson: HoverLesson | null | undefined;
  onCellHover: (hoverLesson?: HoverLesson) => void;
};

// Height of timetable per hour in vertical mode
const VERTICAL_HEIGHT = 2.4;

function TimetableDay(props: Props) {
  const columns = props.endingIndex - props.startingIndex;
  const size = 100 / (columns / 4);

  const rowStyle: React.CSSProperties = {
    // Firefox defaults the second value (width) to auto if not specified
    backgroundSize: `${size}% ${size}%`,
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
