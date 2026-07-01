import * as React from 'react';
import { flattenDeep, noop, values } from 'lodash-es';
import classnames from 'classnames';

import {
  ColoredLesson,
  HoverLesson,
  InteractableLesson,
  TimetableArrangement,
} from 'types/timetables';
import { OnModifyCell } from 'types/views';

import {
  calculateBorderTimings,
  getDayIndex,
  INTERVAL_DURATION_MINS,
  NUM_INTERVALS_PER_HOUR,
  SCHOOLDAYS,
  toSingaporeTime,
} from 'utils/timify';
import elements from 'views/elements';
import withTimer, { TimerData } from 'views/hocs/withTimer';

import { TimePeriod } from 'types/venues';
import styles from './Timetable.scss';
import TimetableTimings from './TimetableTimings';
import TimetableDay from './TimetableDay';

type Props = TimerData & {
  lessons: TimetableArrangement<ColoredLesson | InteractableLesson>;
  // These should be non-optional, but because HOCs currently strip defaultProps
  // for the sake of our sanity we type these as optional to reduce errors at call sites
  isVerticalOrientation?: boolean;
  isScrolledHorizontally?: boolean;
  showTitle?: boolean;
  onModifyCell?: OnModifyCell;
  highlightPeriod?: TimePeriod;
};

type State = {
  hoverLesson: HoverLesson | null;
};

const nullCurrentTimeIndicatorStyle: React.CSSProperties = {
  opacity: 0,
};

const EMPTY_ROW_LESSONS = [[]];

class Timetable extends React.PureComponent<Props, State> {
  static defaultProps = {
    isVerticalOrientation: false,
    isScrolledHorizontally: false,
    showTitle: false,
    onModifyCell: noop,
  };

  override state = {
    hoverLesson: null,
  };

  onCellHover = (hoverLesson: HoverLesson | null) => {
    this.setState({ hoverLesson });
  };

  override render() {
    const { highlightPeriod, currentTime } = this.props;

    const schoolDays = SCHOOLDAYS.filter(
      (day) => day !== 'Saturday' || this.props.lessons.Saturday,
    );

    const lessons = flattenDeep<ColoredLesson>(values(this.props.lessons));
    const { startingIndex, endingIndex } = calculateBorderTimings(lessons, highlightPeriod);

    // The timetable always reflects Singapore time, so derive the current day and
    // time from the SGT wall-clock rather than the viewer's local timezone.
    const singaporeTime = toSingaporeTime(currentTime);
    const currentDayIndex = getDayIndex(singaporeTime); // Monday = 0, Friday = 4

    // Calculate the margin offset for the CurrentTimeIndicator
    const columns = endingIndex - startingIndex;
    const currentHours = singaporeTime.getHours();
    const currentMinutes = singaporeTime.getMinutes();
    const hoursMarginOffset =
      ((currentHours * NUM_INTERVALS_PER_HOUR - startingIndex) / columns) * 100;
    const minutesMarginOffset = (currentMinutes / INTERVAL_DURATION_MINS / columns) * 100;
    const currentTimeIndicatorVisible =
      currentHours * NUM_INTERVALS_PER_HOUR >= startingIndex &&
      currentHours * NUM_INTERVALS_PER_HOUR < endingIndex;
    const dirStyle = this.props.isVerticalOrientation ? 'top' : 'marginLeft';
    const currentTimeIndicatorStyle: React.CSSProperties = {
      [dirStyle]: `${hoursMarginOffset + minutesMarginOffset}%`,
    };

    return (
      <div>
        <div className={classnames(styles.container, elements.timetable)}>
          <TimetableTimings startingIndex={startingIndex} endingIndex={endingIndex} />
          <ol className={styles.days}>
            {schoolDays.map((day, index) => (
              <TimetableDay
                key={day}
                day={day}
                startingIndex={startingIndex}
                endingIndex={endingIndex}
                onModifyCell={this.props.onModifyCell}
                hoverLesson={this.state.hoverLesson}
                onCellHover={this.onCellHover}
                verticalMode={this.props.isVerticalOrientation || false}
                showTitle={this.props.showTitle || false}
                isScrolledHorizontally={this.props.isScrolledHorizontally || false}
                dayLessonRows={this.props.lessons[day] || EMPTY_ROW_LESSONS}
                isCurrentDay={index === currentDayIndex}
                currentTimeIndicatorStyle={
                  index === currentDayIndex && currentTimeIndicatorVisible
                    ? currentTimeIndicatorStyle
                    : nullCurrentTimeIndicatorStyle
                }
                highlightPeriod={
                  highlightPeriod && index === highlightPeriod.day ? highlightPeriod : undefined
                }
              />
            ))}
          </ol>
        </div>
      </div>
    );
  }
}

export default withTimer(Timetable);
