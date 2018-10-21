// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { range } from 'lodash';
import NUSModerator from 'nusmoderator';
import { isSameDay } from 'date-fns';
import type { ColoredLesson, Lesson } from 'types/modules';
import {
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
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
import { daysAfter, getCurrentHours, getCurrentMinutes, getDayIndex } from 'utils/timify';
import DayEvents from './DayEvents';
import DayHeader from './DayHeader';
import styles from './TodayContainer.scss';

type Props = {
  timetableWithLessons: SemTimetableConfigWithLessons,
  colors: ColorMapping,
};

function renderDay(date: Date, lessons: ColoredLesson[], isToday: boolean) {
  // Assume no lessons on public holidays
  if (holidays.some((holiday) => isSameDay(date, holiday))) {
    return <p>Happy holiday!</p>;
  }

  if (!lessons.length) {
    // If it is a weekend / holiday
    if (date.getDay() === 0 || date.getDay() === 6) {
      return <p>Enjoy your weekend!</p>;
    }

    return <p>You have no lessons today</p>;
  }

  // Don't show any lessons in the past
  if (isToday) {
    const currentTime = getCurrentHours() * 100 + getCurrentMinutes();
    // eslint-disable-next-line no-param-reassign
    lessons = lessons.filter((lesson) => parseInt(lesson.EndTime, 10) > currentTime);
  }

  if (!lessons.length) {
    return <p>You have no lessons left today</p>;
  }

  const dayInfo = NUSModerator.academicCalendar.getAcadWeekInfo(date);
  return <DayEvents key={date} lessons={lessons} dayInfo={dayInfo} />;
}

class TodayContainer extends PureComponent<Props> {
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
          const date = daysAfter(today, i);
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
              {renderDay(date, groupedLessons[dayText] || [], i === 0)}
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
