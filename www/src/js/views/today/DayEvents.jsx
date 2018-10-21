// @flow

import type { AcadWeekInfo } from 'nusmoderator';
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import type { ColoredLesson } from 'types/modules';
import { MapPin } from 'views/components/icons';
import { formatTime } from 'utils/timify';
import { isLessonAvailable } from 'utils/timetables';
import styles from './TodayContainer.scss';

type Props = {
  lessons: ColoredLesson[],
  dayInfo: AcadWeekInfo,
};

export default class DayEvents extends PureComponent<Props> {
  render() {
    const { lessons, dayInfo } = this.props;

    const sortedLessons = lessons
      .filter((lesson) => isLessonAvailable(lesson, dayInfo))
      .sort((a, b) => {
        const timeDiff = a.StartTime.localeCompare(b.StartTime);
        return timeDiff !== 0 ? timeDiff : a.ClassNo.localeCompare(b.ClassNo);
      });

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
