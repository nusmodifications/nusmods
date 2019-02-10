import { AcadWeekInfo } from 'nusmoderator';
import { isSameDay } from 'date-fns';
import * as React from 'react';
import classnames from 'classnames';
import { ColoredLesson, Lesson } from 'types/modules';
import { SelectedLesson } from 'types/views';
import { MapPin } from 'views/components/icons';
import { formatTime } from 'utils/timify';
import { isLessonAvailable, isSameLesson } from 'utils/timetables';
import EventMapInline from './EventMapInline';
import styles from './DayEvents.scss';

type Props = {
  readonly lessons: ColoredLesson[];
  readonly date: Date;
  readonly dayInfo: AcadWeekInfo;
  readonly openLesson: SelectedLesson | null | undefined;
  readonly marker: Node;

  readonly onOpenLesson: (date: Date, lesson: Lesson) => void;
};

export default class DayEvents extends React.PureComponent<Props> {
  renderLesson = (lesson: ColoredLesson, i: number) => {
    const { openLesson, onOpenLesson, marker, date } = this.props;

    const isOpen =
      !!openLesson && isSameDay(openLesson.date, date) && isSameLesson(openLesson.lesson, lesson);

    return (
      <div
        className={styles.lesson}
        key={`${lesson.ModuleCode}-${lesson.LessonType}-${lesson.ClassNo}`}
      >
        <div className={styles.lessonTime}>
          <p>{formatTime(lesson.StartTime)}</p>
          {i === 0 && marker}
          <p>{formatTime(lesson.EndTime)}</p>
        </div>

        <div className={classnames(styles.card, `color-${lesson.colorIndex}`)}>
          <h4>
            {lesson.ModuleCode} {lesson.ModuleTitle}
          </h4>
          <p>
            {lesson.LessonType} {lesson.ClassNo}
          </p>
          <MapPin className={styles.venueIcon} /> {lesson.Venue}
          <div>
            <EventMapInline
              className={styles.map}
              venue={lesson.Venue}
              isOpen={isOpen}
              toggleOpen={() => onOpenLesson(date, lesson)}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { lessons, dayInfo } = this.props;

    const sortedLessons = lessons
      .filter((lesson) => isLessonAvailable(lesson, dayInfo))
      .sort((a, b) => {
        const timeDiff = a.StartTime.localeCompare(b.StartTime);
        return timeDiff !== 0 ? timeDiff : a.ClassNo.localeCompare(b.ClassNo);
      });

    return <div>{sortedLessons.map(this.renderLesson)}</div>;
  }
}
