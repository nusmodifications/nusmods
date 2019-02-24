import * as React from 'react';
import classnames from 'classnames';

import { TimetableDayArrangement, HoverLesson } from 'types/timetables';
import { OnHoverCell, OnModifyCell } from 'types/views';
import { ColoredTimePeriod, createGenericColoredTimePeriod } from 'types/timePeriod';
import { convertTimeToIndex } from '../../utils/timify';

import styles from './TimetableDay.scss';
import TimetableHighlight from './TimetableHighlight';
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
  isCurrentDay: boolean;
  currentTimeIndicatorStyle: React.CSSProperties;
  hoverLesson: HoverLesson | null;
  onCellHover: OnHoverCell;
  onModifyCell?: OnModifyCell;
  highlightPeriod?: ColoredTimePeriod;
};

// Height of timetable per hour in vertical mode
const VERTICAL_HEIGHT = 2.4;

function TimetableDay(props: Props) {
  const { startingIndex, endingIndex, verticalMode } = props;
  const totalCols = endingIndex - startingIndex;
  const dirStyle = verticalMode ? 'top' : 'marginLeft';
  const sizeStyle = verticalMode ? 'height' : 'width';
  
  const columns = endingIndex - startingIndex;
  const bgSize = 100 / (columns / 4);
  const rowStyle: React.CSSProperties = {
    // Firefox defaults the second value (width) to auto if not specified
    backgroundSize: `${bgSize}% ${bgSize}%`,
  };

  if (props.verticalMode) rowStyle.height = `${VERTICAL_HEIGHT * columns}rem`;

  function getHighlightPeriod(): ColoredTimePeriod {
    if (props.highlightPeriod !== undefined) {
      return props.highlightPeriod;
    }

    return createGenericColoredTimePeriod();
  }
  const period = getHighlightPeriod();

  let lastStartIndex = startingIndex;
  const lessonStartIndex: number = convertTimeToIndex(period.StartTime);
  const lessonEndIndex: number = convertTimeToIndex(period.EndTime);
  const size: number = lessonEndIndex - lessonStartIndex;

  const dirValue: number = lessonStartIndex - (verticalMode ? startingIndex : lastStartIndex);
  lastStartIndex = lessonEndIndex;
  const highlightStyle = {
    // calc() adds a 1px gap between cells
    [dirStyle]: `calc(${(dirValue / totalCols) * 100}% + 1px)`,
    [sizeStyle]: `calc(${(size / totalCols) * 100}% - 1px)`,
  };

  const highlightPeriodElement: JSX.Element = (
    <TimetableHighlight key="highlightPeriod" highlightPeriod={period} size={size} style={highlightStyle} />
  );

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

        {props.dayLessonRows.map((dayLessonRow, i) => {
          const contents = [];

          const timetableRowElement: JSX.Element = (
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
          );

          // Add components to render
          if (props.highlightPeriod !== undefined && props.highlightPeriod.Day === i) {
            contents.push(highlightPeriodElement);
          }
          contents.push(timetableRowElement);

          return <div key={`day-${i}`}>{contents}</div>;
        })}
      </div>
      {props.isCurrentDay && <div className={classnames('no-export', styles.currentDay)} />}
    </li>
  );
}

export default TimetableDay;
