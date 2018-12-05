// @flow

import type { AcadWeekInfo } from 'nusmoderator';
import React, { PureComponent, type Node } from 'react';
import classnames from 'classnames';
import type { ColoredLesson } from 'types/modules';
import { MapPin } from 'views/components/icons';
import LocationMap from 'views/components/map/LocationMap';
import { formatTime } from 'utils/timify';
import { isLessonAvailable } from 'utils/timetables';
import styles from './DayEvents.scss';

type Props = {
  lessons: ColoredLesson[],
  dayInfo: AcadWeekInfo,
  marker: Node,
};

type State = {
  openLessonMap: ?number,
};

export default class DayEvents extends PureComponent<Props, State> {
  state: State = {
    openLessonMap: null,
  };

  toggleMap = (index: number) => {
    this.setState({
      openLessonMap: this.state.openLessonMap === index ? null : index,
    });
  };

  render() {
    const { lessons, dayInfo, marker } = this.props;

    const sortedLessons = lessons
      .filter((lesson) => isLessonAvailable(lesson, dayInfo))
      .sort((a, b) => {
        const timeDiff = a.StartTime.localeCompare(b.StartTime);
        return timeDiff !== 0 ? timeDiff : a.ClassNo.localeCompare(b.ClassNo);
      });

    return (
      <div>
        {sortedLessons.map((lesson, i) => (
          <div
            className={styles.lesson}
            key={`${lesson.ModuleCode}-${lesson.LessonType}-${lesson.ClassNo}`}
          >
            <div className={styles.lessonTime}>
              <p>{formatTime(lesson.StartTime)}</p>
              {i === 0 && marker}
              <p>{formatTime(lesson.EndTime)}</p>
            </div>

            <div
              className={classnames(styles.card, `color-${lesson.colorIndex}`)}
              role="button"
              tabIndex="-1"
              onClick={() => this.toggleMap(i)}
            >
              <h4>
                {lesson.ModuleCode} {lesson.ModuleTitle}
              </h4>
              <p>
                {lesson.LessonType} {lesson.ClassNo}
              </p>
              {this.state.openLessonMap === i ? (
                <LocationMap venue={lesson.Venue} />
              ) : (
                <p>
                  <MapPin className={styles.venueIcon} /> {lesson.Venue}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
