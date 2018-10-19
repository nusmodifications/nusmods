// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import type { ColoredLesson } from 'types/modules';
import { MapPin } from 'views/components/icons';
import { formatTime, getCurrentHours, getCurrentMinutes } from 'utils/timify';
import styles from './TodayContainer.scss';

type Props = {
  lessons: ColoredLesson[],
  isToday: boolean,
};

export default class DayEvents extends PureComponent<Props> {
  render() {
    const { lessons, isToday } = this.props;

    let sortedLessons = lessons.sort((a, b) => {
      const timeDiff = a.StartTime.localeCompare(b.StartTime);
      return timeDiff !== 0 ? timeDiff : a.ClassNo.localeCompare(b.ClassNo);
    });

    // Don't show any lessons in the past
    if (isToday) {
      const currentTime = getCurrentHours() * 100 + getCurrentMinutes();
      sortedLessons = sortedLessons.filter((lesson) => parseInt(lesson.EndTime, 10) > currentTime);
    }

    return (
      <div>
        {sortedLessons.map((lesson) => (
          <div
            className={styles.lesson}
            key={`${lesson.ModuleCode}-${lesson.LessonType}-${lesson.ClassNo}`}
          >
            <div className={styles.lessonTime}>
              <p>{formatTime(lesson.StartTime)}</p>
              <p>{formatTime(lesson.EndTime)}</p>
            </div>

            <div className={classnames(styles.card, `color-${lesson.colorIndex}`)}>
              <h4>
                {lesson.ModuleCode} {lesson.ModuleTitle}
              </h4>
              <p>
                {lesson.LessonType} {lesson.ClassNo}
              </p>
              <p>
                <MapPin className={styles.venueIcon} /> {lesson.Venue}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
