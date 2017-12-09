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
  onClick: (Venue, string) => void,
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
    const venueHref = `/venues/${encodeURIComponent(name)}`;

    return (
      <li className={styles.venueDetailRow}>
        <h4>
          <a
            href={venueHref}
            onClick={(e) => {
              e.preventDefault();
              onClick(name, venueHref);
            }}
          >{name}</a>
        </h4>
        {lessons ? (
          <div className={styles.venueTimetable}>
            <Timetable
              lessons={lessons}
              isVerticalOrientation={false}
              onModifyCell={noop}
            />
          </div>
        ) : null}
      </li>
    );
  }
}
