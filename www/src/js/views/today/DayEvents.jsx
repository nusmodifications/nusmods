// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import type { ColoredLesson } from 'types/modules';
import { MapPin } from 'views/components/icons';
import { getCurrentHours, getCurrentMinutes } from 'utils/timify';
import styles from './DayEvents.scss';

type Props = {
  lessons: ColoredLesson[],
  date: ?string,
  isToday: boolean,
};

export default class DayEvents extends PureComponent<Props> {
  render() {
    const { lessons, date, isToday } = this.props;

    // if (lessons.length === 0) {
    //   return null;
    // }

    let sortedLessons = lessons.sort((a, b) => {
      const timeDiff = a.StartTime.localeCompare(b.StartTime);
      return timeDiff !== 0 ? timeDiff : a.ClassNo.localeCompare(b.ClassNo);
    });

    if (isToday) {
      const currentTime = getCurrentHours() * 100 + getCurrentMinutes();
      sortedLessons = sortedLessons.filter((lesson) => parseInt(lesson.EndTime, 10) > currentTime);
    }

    return (
      <div className={styles.day}>
        {date && <h3>{date}</h3>}

        {sortedLessons.length === 0 &&
          (isToday ? (
            <p className="text-center h4">
              Your school day is over for today!{' '}
              <span className="h3" role="img" aria-label="Tada!">
                🎉
              </span>
            </p>
          ) : (
            <p className="text-center h4">Enjoy your weekend!</p>
          ))}

        {sortedLessons.map((lesson) => (
          <div
            key={`${lesson.ModuleCode}-${lesson.LessonType}-${lesson.ClassNo}`}
            className={styles.lesson}
          >
            <div className={classnames(styles.moduleStripe, `color-${lesson.colorIndex}`)} />
            <div>
              <div className={styles.lessonTime}>
                {lesson.StartTime}-{lesson.EndTime}
              </div>
              <h4>
                {lesson.ModuleCode} {lesson.LessonType}
              </h4>
              <p>
                <MapPin /> {lesson.Venue}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
