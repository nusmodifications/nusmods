// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { range } from 'lodash';
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
import Announcements from 'views/components/Announcements';
import RefreshPrompt from 'views/components/RefreshPrompt';
import { getSemesterTimetable } from 'reducers/timetables';
import { DaysOfWeek } from 'types/modules';
import config from 'config';
import { daysAfter } from 'utils/timify';
import DayEvents from './DayEvents';

type Props = {
  timetableWithLessons: SemTimetableConfigWithLessons,
  colors: ColorMapping,
};

const monthNames = [
  'January ',
  'February ',
  'March ',
  'April ',
  'May ',
  'June ',
  'July ',
  'August ',
  'September ',
  'October ',
  'November ',
  'December ',
];

function getDayName(date: Date) {
  // -1 because JS weeks start at
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return `${DaysOfWeek[dayIndex]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
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

    let dayNames = [];

    // Add in the days for the rest of the week
    dayNames = dayNames.concat(
      range(dayNames.length, 7).map((i) => getDayName(daysAfter(today, i))),
    );

    // Reorder and rotate the lessons
    const days = [...range(today.getDay() - 1, 7), ...range(today.getDay())];

    return (
      <div className="page-container">
        <Title>Today</Title>

        <CorsNotification />

        <Announcements />

        <RefreshPrompt />

        <h1>
          {today.getDate()} {monthNames[today.getMonth()]}
        </h1>

        {days.map((day, i) => (
          <DayEvents
            key={day}
            lessons={groupedLessons[DaysOfWeek[day]] || []}
            date={dayNames[day]}
            isToday={i === 0}
          />
        ))}
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
