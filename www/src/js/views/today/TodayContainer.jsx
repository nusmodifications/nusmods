// @flow

import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { range, minBy } from 'lodash';
import classnames from 'classnames';
import NUSModerator from 'nusmoderator';
import { isSameDay, addDays, formatDistanceStrict } from 'date-fns';
import type { ColoredLesson, Lesson } from 'types/modules';
import {
  getStartTimeAsDate,
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
  isLessonOngoing,
  timetableLessonsArray,
} from 'utils/timetables';
import type { SemTimetableConfigWithLessons } from 'types/timetables';
import type { ColorMapping } from 'types/reducers';
import Title from 'views/components/Title';
import CorsNotification from 'views/components/cors-info/CorsNotification';
import Announcements from 'views/components/notfications/Announcements';
import RefreshPrompt from 'views/components/notfications/RefreshPrompt';
import { getSemesterTimetable } from 'reducers/timetables';
import { DaysOfWeek } from 'types/modules';
import config from 'config';
/** @var {string[]} */
import holidays from 'data/holidays.json';
import { formatTime, getCurrentHours, getCurrentMinutes, getDayIndex } from 'utils/timify';
import DayEvents from './DayEvents';
import DayHeader from './DayHeader';
import styles from './TodayContainer.scss';

type Props = {
  timetableWithLessons: SemTimetableConfigWithLessons,
  colors: ColorMapping,
};

type State = {
  currentTime: Date,
};

class TodayContainer extends PureComponent<Props, State> {
  state: State = {
    currentTime: new Date(),
  };

  componentDidMount() {
    this.intervalId = setInterval(() => this.setState({ currentTime: new Date() }), 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  intervalId;

  renderDay(date: Date, lessons: ColoredLesson[], isToday: boolean) {
    let firstLessonMarker = null;
    let beforeFirstLessonBlock = null;

    // Assume no lessons on public holidays
    if (holidays.some((holiday) => isSameDay(date, holiday))) {
      return <p>Happy holiday!</p>;
    }

    if (!lessons.length) {
      // If it is a weekend / holiday
      return date.getDay() === 0 || date.getDay() === 6 ? (
        <p>Enjoy your weekend!</p>
      ) : (
        <p>You have no lessons today</p>
      );
    }

    // Don't show any lessons in the past, and add the current time marker
    if (isToday) {
      const currentTime = getCurrentHours() * 100 + getCurrentMinutes();
      // eslint-disable-next-line no-param-reassign
      lessons = lessons.filter((lesson) => parseInt(lesson.EndTime, 10) > currentTime);

      const nextLesson = minBy(lessons, (lesson) => lesson.StartTime);

      if (nextLesson) {
        const marker = <p className={styles.nowMarker}>{formatTime(currentTime)}</p>;

        if (isLessonOngoing(nextLesson, currentTime)) {
          firstLessonMarker = marker;
        } else {
          const nextLessonDate = getStartTimeAsDate(nextLesson);

          beforeFirstLessonBlock = (
            <div className={styles.lesson}>
              <div className={styles.lessonTime}>
                <p />
                {marker}
                <p />
              </div>
              <div className={classnames(styles.card, styles.inBetweenClass)}>
                <p>
                  You have{' '}
                  <strong>{formatDistanceStrict(nextLessonDate, this.state.currentTime)}</strong>{' '}
                  till the next class.
                </p>
              </div>
            </div>
          );
        }
      }
    }

    if (!lessons.length) {
      return <p>You have no lessons left today</p>;
    }

    const dayInfo = NUSModerator.academicCalendar.getAcadWeekInfo(date);
    return (
      <Fragment>
        {beforeFirstLessonBlock}
        <DayEvents key={date} lessons={lessons} dayInfo={dayInfo} marker={firstLessonMarker} />
      </Fragment>
    );
  }

  render() {
    const { colors } = this.props;

    const timetableLessons: Lesson[] = timetableLessonsArray(this.props.timetableWithLessons);

    // Inject color into module
    const coloredTimetableLessons = timetableLessons.map((lesson: Lesson): ColoredLesson => ({
      ...lesson,
      colorIndex: colors[lesson.ModuleCode],
    }));

    const groupedLessons = groupLessonsByDay(coloredTimetableLessons);
    const today = new Date();

    return (
      <div className="page-container">
        <Title>Today</Title>

        <CorsNotification />

        <Announcements />

        <RefreshPrompt />

        {range(7).map((i) => {
          const date = addDays(today, i);
          const dayText = DaysOfWeek[getDayIndex(date)];

          let dayName;
          if (i === 0) {
            dayName = 'Today';
          } else if (i === 1) {
            dayName = 'Tomorrow';
          } else {
            dayName = dayText;
          }

          return (
            <section className={styles.day} key={i}>
              <DayHeader date={date} dayName={dayName} />
              {this.renderDay(date, groupedLessons[dayText] || [], i === 0)}
            </section>
          );
        })}
      </div>
    );
  }
}

export default connect((state) => {
  const modules = state.moduleBank.modules;
  const semester = config.semester;
  const { timetable, colors } = getSemesterTimetable(semester, state.timetables);
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);

  return {
    colors,
    timetableWithLessons,
  };
})(TodayContainer);
