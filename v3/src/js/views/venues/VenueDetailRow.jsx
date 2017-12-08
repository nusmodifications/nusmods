// @flow
import React, { PureComponent } from 'react';
import { flatten, noop } from 'lodash';
import { arrangeLessonsForWeek, colorLessonsByType } from 'utils/timetables';
import Timetable from 'views/timetable/Timetable';

import type { DayAvailability } from 'types/venues';
import type { Venue } from 'types/modules';

import styles from './VenueDetailRow.scss';

type Props = {
  name: Venue,
  availability: DayAvailability[],
  expanded: boolean,
  onClick: () => void,
}

export default class VenueDetailRow extends PureComponent<Props> {
  static defaultProps = {
    name: '',
    availability: [],
    expanded: false,
    onClick: noop,
  };

  arrangedLessons() {
    if (!this.props.expanded) {
      return null;
    }

    const availability: DayAvailability[] = this.props.availability;
    // const lessons = flatMap(availability, a => a.Classes) // Not using flatMap as it results in a Flow error
    const lessons = flatten(availability.map(dayAvail => dayAvail.Classes))
      .map(venueLesson => ({ ...venueLesson, ModuleTitle: '' }));
    const coloredLessons = colorLessonsByType(lessons);
    return arrangeLessonsForWeek(coloredLessons);
  }

  render() {
    const { name, onClick } = this.props;
    const lessons = this.arrangedLessons();

    return (
      <div>
        <h4 className={styles.venueName}><a onClick={onClick}>{name}</a></h4>
        {lessons ? (
          <div className={styles.venueTimetable}>
            <Timetable
              lessons={lessons}
              isVerticalOrientation={false}
              onModifyCell={noop}
            />
          </div>
        ) : null}
      </div>
    );
  }
}
