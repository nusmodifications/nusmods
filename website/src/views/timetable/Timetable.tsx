import * as React from 'react';
import { flattenDeep, noop, values } from 'lodash';
import classnames from 'classnames';

import { ColoredLesson, HoverLesson, TimetableArrangement } from 'types/timetables';
import { OnModifyCell } from 'types/views';

import {
  calculateBorderTimings,
  getCurrentHours,
  getCurrentMinutes,
  getDayIndex,
  SCHOOLDAYS,
} from 'utils/timify';
import elements from 'views/elements';
import withTimer, { TimerData } from 'views/hocs/withTimer';

import { TimePeriod } from 'types/venues';
import styles from './Timetable.scss';
import TimetableTimings from './TimetableTimings';
import TimetableDay from './TimetableDay';
import { ModuleCode } from 'types/modules';

type Props = TimerData & {
  lessons: TimetableArrangement;
  // These should be non-optional, but because HOCs currently strip defaultProps
  // for the sake of our sanity we type these as optional to reduce errors at call sites
  isVerticalOrientation?: boolean;
  isScrolledHorizontally?: boolean;
  showTitle?: boolean;
  onModifyCell?: OnModifyCell;
  highlightPeriod?: TimePeriod;
  customisedModules?: ModuleCode[];
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

  state = {
    hoverLesson: null,
  };

  onCellHover = (hoverLesson: HoverLesson | null) => {
    this.setState({ hoverLesson });
  };

  render() {
    const { highlightPeriod } = this.props;

    const schoolDays = SCHOOLDAYS.filter(
      (day) => day !== 'Saturday' || this.props.lessons.Saturday,
    );

    const lessons = flattenDeep<ColoredLesson>(values(this.props.lessons));
    const { startingIndex, endingIndex } = calculateBorderTimings(lessons, highlightPeriod);
    const currentDayIndex = getDayIndex(); // Monday = 0, Friday = 4

    // Calculate the margin offset for the CurrentTimeIndicator
    const columns = endingIndex - startingIndex;
    const currentHours = getCurrentHours();
    const currentMinutes = getCurrentMinutes();
    const hoursMarginOffset = ((currentHours * 2 - startingIndex) / columns) * 100;
    const minutesMarginOffset = (currentMinutes / 30 / columns) * 100;
    const currentTimeIndicatorVisible =
      currentHours * 2 >= startingIndex && currentHours * 2 < endingIndex;
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
                customisedModules={this.props.customisedModules}
              />
            ))}
          </ol>
        </div>
      </div>
    );
  }
}

export default withTimer(Timetable);
