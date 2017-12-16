// @flow
import React, { PureComponent } from 'react';
import { flatMap, noop } from 'lodash';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { colorLessonsByKey } from 'utils/colors';
import Timetable from 'views/timetable/Timetable';

import type { DayAvailability, VenueLesson } from 'types/venues';
import type { Venue } from 'types/modules';

import styles from './VenueDetailRow.scss';

type Props = {
  name: Venue,
  availability: DayAvailability[],
  expanded: boolean,
  onClick: (Venue, string) => void,
  rootElementRef?: (?HTMLElement) => void, // For parent components to obtain a ref to the root HTMLElement
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
    const lessons = flatMap(availability, (day): VenueLesson[] => day.Classes)
      .map(venueLesson => ({ ...venueLesson, ModuleTitle: '' }));
    const coloredLessons = colorLessonsByKey(lessons, 'ModuleCode');
    return arrangeLessonsForWeek(coloredLessons);
  }

  render() {
    const { name, onClick } = this.props;
    const lessons = this.arrangedLessons();
    const venueHref = `/venues/${encodeURIComponent(name)}`;
    const rootElementRef: Function = this.props.rootElementRef || (() => {});

    return (
      <li className={styles.venueDetailRow} ref={rootElementRef}>
        <a
          href={venueHref}
          onClick={(e) => {
            e.preventDefault();
            onClick(name, venueHref);
          }}
        ><h4>{name}</h4></a>
        {lessons && (
          <div className={styles.venueTimetable}>
            <Timetable
              lessons={lessons}
              isVerticalOrientation={false}
              onModifyCell={noop}
            />
          </div>
        )}
      </li>
    );
  }
}
