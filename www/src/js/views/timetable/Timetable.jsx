// @flow
import React, { PureComponent } from 'react';
import { values, flattenDeep, noop } from 'lodash';
import classnames from 'classnames';

import type { Lesson } from 'types/modules';
import type { HoverLesson, TimetableArrangement } from 'types/timetables';

import {
  SCHOOLDAYS,
  calculateBorderTimings,
  getDayIndex,
  getCurrentHours,
  getCurrentMinutes,
} from 'utils/timify';
import elements from 'views/elements';

import styles from './Timetable.scss';
import TimetableTimings from './TimetableTimings';
import TimetableDay from './TimetableDay';

type Props = {
  lessons: TimetableArrangement,
  isVerticalOrientation: boolean,
  isScrolledHorizontally: boolean,
  showTitle: boolean,
  onModifyCell: Function,
};

type State = {
  hoverLesson: ?HoverLesson,
};

class Timetable extends PureComponent<Props, State> {
  interval: IntervalID;

  static defaultProps = {
    isVerticalOrientation: false,
    isScrolledHorizontally: false,
    showTitle: false,
    onModifyCell: noop,
  };

  state = {
    hoverLesson: null,
  };

  componentDidMount() {
    this.interval = setInterval(() => {
      this.forceUpdate();
    }, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onCellHover = (hoverLesson: ?HoverLesson) => {
    this.setState({ hoverLesson });
  };

  render() {
    const schoolDays = SCHOOLDAYS.filter(
      (day) => day !== 'Saturday' || this.props.lessons.Saturday,
    );

    const lessons: Array<Lesson> = flattenDeep(values(this.props.lessons));
    const { startingIndex, endingIndex } = calculateBorderTimings(lessons);
    const currentDayIndex = getDayIndex(); // Monday = 0, Friday = 4

    // Calculate the margin offset for the CurrentTimeIndicator
    const columns = endingIndex - startingIndex;
    const currentHours = getCurrentHours();
    const currentMinutes = getCurrentMinutes();
    const hoursMarginOffset = (currentHours * 2 - startingIndex) / columns * 100;
    const minutesMarginOffset = currentMinutes / 30 / columns * 100;
    const currentTimeIndicatorVisible =
      currentHours * 2 >= startingIndex && currentHours * 2 < endingIndex;
    const dirStyle = this.props.isVerticalOrientation ? 'top' : 'marginLeft';
    const currentTimeIndicatorStyle: Object = {
      [dirStyle]: `${hoursMarginOffset + minutesMarginOffset}%`,
    };
    const nullCurrentTimeIndicatorStyle: Object = {
      opacity: 0,
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
                verticalMode={this.props.isVerticalOrientation}
                showTitle={this.props.showTitle}
                dayLessonRows={this.props.lessons[day] || [[]]}
                isScrolledHorizontally={this.props.isScrolledHorizontally}
                isCurrentDay={index === currentDayIndex}
                currentTimeIndicatorStyle={
                  index === currentDayIndex && currentTimeIndicatorVisible
                    ? currentTimeIndicatorStyle
                    : nullCurrentTimeIndicatorStyle
                }
              />
            ))}
          </ol>
        </div>
      </div>
    );
  }
}

export default Timetable;
