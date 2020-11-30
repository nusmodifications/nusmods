import * as React from 'react';
import { AcadWeekInfo } from 'nusmoderator';
import { isSameDay } from 'date-fns';
import classnames from 'classnames';

import { Lesson, ColoredLesson } from 'types/timetables';
import { SelectedLesson } from 'types/views';
import { MapPin } from 'react-feather';
import { formatTime } from 'utils/timify';
import { isLessonAvailable, isSameLesson } from 'utils/timetables';
import EventMapInline from './EventMapInline';
import styles from './DayEvents.scss';

type Props = {
  readonly lessons: ColoredLesson[];
  readonly date: Date;
  readonly dayInfo: AcadWeekInfo;
  readonly openLesson: SelectedLesson | null;
  readonly marker: React.ReactNode;

  readonly onOpenLesson: (date: Date, lesson: Lesson) => void;
};

const DayEvents = React.memo<Props>((props) => {
  const renderLesson = (lesson: ColoredLesson, i: number) => {
    const { openLesson, onOpenLesson, marker, date } = props;

    const isOpen =
      !!openLesson && isSameDay(openLesson.date, date) && isSameLesson(openLesson.lesson, lesson);

    return (
      <div
        className={styles.lesson}
        key={`${lesson.moduleCode}-${lesson.lessonType}-${lesson.classNo}`}
      >
        <div className={styles.lessonTime}>
          <p>{formatTime(lesson.startTime)}</p>
          {i === 0 && marker}
          <p>{formatTime(lesson.endTime)}</p>
        </div>

        <div className={classnames(styles.card, `color-${lesson.colorIndex}`)}>
          <h4>
            {lesson.moduleCode} {lesson.title}
          </h4>
          <p>
            {lesson.lessonType} {lesson.classNo}
          </p>
          <MapPin className={styles.venueIcon} />{' '}
          {lesson.venue.startsWith('E-Learn') ? 'E-Learning' : lesson.venue}
          <div>
            <EventMapInline
              className={styles.map}
              venue={lesson.venue}
              isOpen={isOpen}
              toggleOpen={() => onOpenLesson(date, lesson)}
            />
          </div>
        </div>
      </div>
    );
  };

  const { lessons, date, dayInfo } = props;

  const sortedLessons = lessons
    .filter((lesson) => isLessonAvailable(lesson, date, dayInfo))
    .sort((a, b) => {
      const timeDiff = a.startTime.localeCompare(b.startTime);
      return timeDiff !== 0 ? timeDiff : a.classNo.localeCompare(b.classNo);
    });

  return <div>{sortedLessons.map(renderLesson)}</div>;
});

export default DayEvents;
