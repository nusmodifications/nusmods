import * as React from 'react';
import classnames from 'classnames';

import { HoverLesson, TimetableDayArrangement } from 'types/timetables';
import { OnHoverCell, OnModifyCell } from 'types/views';
import { convertTimeToIndex } from 'utils/timify';

import { TimePeriod } from 'types/venues';
import styles from './TimetableDay.scss';
import TimetableRow from './TimetableRow';
import CurrentTimeIndicator from './CurrentTimeIndicator';
import TimetableHighlight from './TimetableHighlight';
import { ModuleCode } from 'types/modules';

type Props = {
  day: string;
  dayLessonRows: TimetableDayArrangement;
  verticalMode: boolean;
  showTitle: boolean;
  isScrolledHorizontally: boolean;
  startingIndex: number;
  endingIndex: number;
  isCurrentDay: boolean;
  currentTimeIndicatorStyle: React.CSSProperties;
  hoverLesson: HoverLesson | null;
  onCellHover: OnHoverCell;
  onModifyCell?: OnModifyCell;
  highlightPeriod?: TimePeriod;
  customisedModules?: ModuleCode[];
};

// Height of timetable per hour in vertical mode
const VERTICAL_HEIGHT = 2.4;

function calculateLessonStyle(
  period: TimePeriod,
  startingIndex: number,
  endingIndex: number,
  verticalMode: boolean,
): React.CSSProperties {
  const totalCols = endingIndex - startingIndex;

  const startIndex = convertTimeToIndex(period.startTime);
  const endIndex = convertTimeToIndex(period.endTime);
  const size = endIndex - startIndex;

  const dirStyle = verticalMode ? 'top' : 'left';
  const sizeStyle = verticalMode ? 'height' : 'width';

  return {
    [dirStyle]: `calc(${((startIndex - startingIndex) / totalCols) * 100}% + 1px)`,
    [sizeStyle]: `calc(${(size / totalCols) * 100}% - 1px)`,
  };
}

const TimetableDay: React.FC<Props> = (props) => {
  const { startingIndex, endingIndex, verticalMode, highlightPeriod } = props;

  const columns = endingIndex - startingIndex;
  const size = 100 / (columns / 4);

  const rowStyle: React.CSSProperties = {
    // Firefox defaults the second value (width) to auto if not specified
    backgroundSize: `${size}% ${size}%`,
  };

  if (verticalMode) rowStyle.height = `${VERTICAL_HEIGHT * columns}rem`;

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
            startingIndex={startingIndex}
            endingIndex={endingIndex}
            verticalMode={verticalMode}
            showTitle={props.showTitle}
            lessons={dayLessonRow}
            onModifyCell={props.onModifyCell}
            hoverLesson={props.hoverLesson}
            onCellHover={props.onCellHover}
            customisedModules={props.customisedModules}
          />
        ))}

        {highlightPeriod && (
          <TimetableHighlight
            style={calculateLessonStyle(highlightPeriod, startingIndex, endingIndex, verticalMode)}
          />
        )}
      </div>

      {props.isCurrentDay && <div className={classnames('no-export', styles.currentDay)} />}
    </li>
  );
};

export default TimetableDay;
