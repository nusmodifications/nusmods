// @flow
import React, { PureComponent } from 'react';
import { values, flattenDeep, noop } from 'lodash';

import type { Lesson } from 'types/modules';
import type { TimetableArrangement } from 'types/timetables';

import {
  SCHOOLDAYS,
  calculateBorderTimings,
} from 'utils/timify';

import styles from './Timetable.scss';
import TimetableTimings from './TimetableTimings';
import TimetableDay from './TimetableDay';

type Props = {
  lessons: TimetableArrangement,
  isVerticalOrientation: boolean,
  isScrolledHorizontally: boolean,
  onModifyCell: Function,
};

class Timetable extends PureComponent<Props> {
  timetableDom: ?HTMLDivElement;

  static defaultProps = {
    isVerticalOrientation: false,
    isScrolledHorizontally: false,
    onModifyCell: noop,
  };

  render() {
    const schoolDays = SCHOOLDAYS.filter(day => day !== 'Saturday' || this.props.lessons.Saturday);

    const lessons: Array<Lesson> = flattenDeep(values(this.props.lessons));
    const { startingIndex, endingIndex } = calculateBorderTimings(lessons);

    return (
      <div ref={(r) => { this.timetableDom = r; }}>
        <div className={styles.container}>
          <TimetableTimings
            startingIndex={startingIndex}
            endingIndex={endingIndex}
          />
          <ol className={styles.days}>
            {schoolDays.map(day => (
              <TimetableDay
                key={day}
                day={day}
                startingIndex={startingIndex}
                endingIndex={endingIndex}
                onModifyCell={this.props.onModifyCell}
                verticalMode={this.props.isVerticalOrientation}
                dayLessonRows={this.props.lessons[day] || [[]]}
                isScrolledHorizontally={this.props.isScrolledHorizontally}
              />
            ))}
          </ol>
        </div>
      </div>
    );
  }
}

export default Timetable;
