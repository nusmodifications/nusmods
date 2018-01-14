// @flow
import React, { PureComponent } from 'react';
import { values, flattenDeep, noop } from 'lodash';

import type { Lesson } from 'types/modules';
import type { TimetableArrangement } from 'types/timetables';

import {
  SCHOOLDAYS,
  calculateBorderTimings,
  getCurrentDayIndex,
  getCurrentHours,
  getCurrentMinutes,
} from 'utils/timify';

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

class Timetable extends PureComponent<Props> {
  timetableDom: ?HTMLDivElement;
  interval: ?number;

  static defaultProps = {
    isVerticalOrientation: false,
    isScrolledHorizontally: false,
    showTitle: false,
    onModifyCell: noop,
  };

  constructor(props: Props) {
    super(props);
    this.interval = null;
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.forceUpdate();
    }, 60000);
  }

  componentWillUnmount() {
    if (this.interval !== null) {
      clearInterval(this.interval);
    }
  }

  render() {
    const schoolDays = SCHOOLDAYS.filter(
      (day) => day !== 'Saturday' || this.props.lessons.Saturday,
    );

    const lessons: Array<Lesson> = flattenDeep(values(this.props.lessons));
    const { startingIndex, endingIndex } = calculateBorderTimings(lessons);
    const currentDayIndex: number = getCurrentDayIndex(); // Monday = 0, Friday = 4

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
      <div
        ref={(r) => {
          this.timetableDom = r;
        }}
      >
        <div className={styles.container}>
          <TimetableTimings startingIndex={startingIndex} endingIndex={endingIndex} />
          <ol className={styles.days}>
            {schoolDays.map((day, index) => (
              <TimetableDay
                key={day}
                day={day}
                startingIndex={startingIndex}
                endingIndex={endingIndex}
                onModifyCell={this.props.onModifyCell}
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
