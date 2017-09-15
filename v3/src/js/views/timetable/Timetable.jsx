// @flow
import React, { PureComponent } from 'react';
import _ from 'lodash';

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
  onModifyCell: Function,
};

class Timetable extends PureComponent<Props> {
  props: Props;
  timetableDom: ?HTMLDivElement;

  render() {
    const schoolDays = SCHOOLDAYS.filter(day => day !== 'Saturday' || this.props.lessons.Saturday);

    const lessons: Array<Lesson> = _.flattenDeep(Object.values(this.props.lessons));
    const { startingIndex, endingIndex } = calculateBorderTimings(lessons);

    return (
      <div
        className={styles.container}
        ref={(r) => { this.timetableDom = r; }}
      >
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
            />
          ))}
        </ol>
      </div>
    );
  }
}

export default Timetable;
