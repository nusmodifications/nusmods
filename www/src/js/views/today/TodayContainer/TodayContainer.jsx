// @flow

import React, { Fragment, PureComponent, type Node } from 'react';
import { connect } from 'react-redux';
import { minBy, range } from 'lodash';
import NUSModerator, { type AcadWeekInfo } from 'nusmoderator';
import Raven from 'raven-js';
import { addDays, differenceInCalendarDays, isSameDay, isWeekend } from 'date-fns';

import type { ColoredLesson, Lesson } from 'types/modules';
import { DaysOfWeek } from 'types/modules';
import type { SemTimetableConfigWithLessons } from 'types/timetables';
import type { ColorMapping } from 'types/reducers';
import type { EmptyGroupType, SelectedLesson } from 'types/views';

import {
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
  isLessonOngoing,
  timetableLessonsArray,
} from 'utils/timetables';
import Title from 'views/components/Title';
import CorsNotification from 'views/components/cors-info/CorsNotification';
import Announcements from 'views/components/notfications/Announcements';
import RefreshPrompt from 'views/components/notfications/RefreshPrompt';
import ExternalLink from 'views/components/ExternalLink';
import { getSemesterTimetable } from 'reducers/timetables';
import * as weatherAPI from 'apis/weather';
import config from 'config';
/** @var {string[]} */
import holidays from 'data/holidays.json';
import withTimer, { type TimerData } from 'views/hocs/withTimer';
import { formatTime, getCurrentHours, getCurrentMinutes, getDayIndex } from 'utils/timify';
import DayEvents from '../DayEvents';
import DayHeader from '../DayHeader';
import EmptyLessonGroup from '../EmptyLessonGroup';
import BeforeLessonCard from '../BeforeLessonCard';
import styles from './TodayContainer.scss';

export type Props = {|
  ...TimerData,

  +timetableWithLessons: SemTimetableConfigWithLessons,
  +colors: ColorMapping,
|};

type State = {|
  // Mapping of number of days from today to the weather forecast for that day
  // with zero being today
  +weather: { [string]: string },

  // Which lesson has an open venue map
  +openLesson: ?SelectedLesson,
|};

const EMPTY_ARRAY = [];

function getDayType(date: Date, weekInfo: AcadWeekInfo): EmptyGroupType {
  switch (weekInfo.type) {
    case 'Reading':
    case 'Examination':
      return 'reading';
    case 'Orientation':
      return 'orientation';
    case 'Recess':
      return 'recess';
    case 'Vacation': {
      const month = date.getMonth();
      return month > 8 || month < 3 ? 'winter' : 'summer';
    }
    default:
      if (isWeekend(date)) return 'weekend';
      return 'holiday';
  }
}

export function DaySection(props: {|
  +children: Node,
  +date: Date | Date[],
  +offset: number,
  +forecast?: string,
|}) {
  return (
    <section className={styles.day}>
      <DayHeader date={props.date} offset={props.offset} forecast={props.forecast} />
      {props.children}
    </section>
  );
}

export class TodayContainerComponent extends PureComponent<Props, State> {
  state: State = {
    weather: {},
    openLesson: null,
  };

  componentDidMount() {
    weatherAPI
      .twoHour()
      .then((weather) => this.setState({ weather: { ...this.state.weather, '0': weather } }))
      .catch((e) => Raven.captureException(e));

    weatherAPI
      .tomorrow()
      .then((weather) => this.setState({ weather: { ...this.state.weather, '1': weather } }))
      .catch((e) => Raven.captureException(e));

    weatherAPI
      .fourDay()
      .then((forecasts) => {
        forecasts.forEach((forecast) => {
          const days = differenceInCalendarDays(forecast.timestamp, this.props.currentTime);

          if (!this.state.weather[String(days)]) {
            this.setState({ weather: { ...this.state.weather, [days]: forecast.forecast } });
          }
        });
      })
      .catch((e) => Raven.captureException(e));
  }

  onOpenLesson = (date: Date, lesson: Lesson) => {
    this.setState({ openLesson: { date, lesson } });
  };

  groupLessons() {
    const { colors, currentTime } = this.props;

    const timetableLessons: Lesson[] = timetableLessonsArray(this.props.timetableWithLessons);

    // Inject color into module
    const coloredTimetableLessons = timetableLessons.map(
      (lesson: Lesson): ColoredLesson => ({
        ...lesson,
        colorIndex: colors[lesson.ModuleCode],
      }),
    );

    const groupedLessons = groupLessonsByDay(coloredTimetableLessons);

    // Group empty days / non-instructional dates together
    const days = [];
    let currentGroup = null;

    const pushCurrentGroup = () => {
      if (!currentGroup) return;
      const { dates, type, offset } = currentGroup;
      days.push(
        <DaySection date={dates} offset={offset} key={offset}>
          <EmptyLessonGroup type={type} />
        </DaySection>,
      );
      days.push();
      currentGroup = null;
    };

    const addEmptyDate = (date: Date, weekInfo: AcadWeekInfo, offset: number) => {
      const type = getDayType(date, weekInfo);
      if (!currentGroup || currentGroup.type !== type) {
        pushCurrentGroup();

        currentGroup = {
          offset,
          type,
          dates: [],
        };
      }

      currentGroup.dates.push(date);
    };

    range(7).forEach((day) => {
      const date = addDays(currentTime, day);
      const dayOfWeek = DaysOfWeek[getDayIndex(date)];
      const weekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(date);
      const lessons = groupedLessons[dayOfWeek] || EMPTY_ARRAY;

      if (
        // Non-instructional week
        weekInfo.type !== 'Instructional' ||
        // Holiday during instructional week
        holidays.some((holiday) => isSameDay(date, holiday)) ||
        // Weekend with no lesson
        (lessons.length === 0 && isWeekend(date))
      ) {
        addEmptyDate(date, weekInfo, day);
      } else {
        pushCurrentGroup();

        const forecast = this.state.weather[String(day)];

        days.push(
          <DaySection date={date} offset={day} forecast={forecast} key={day}>
            {this.renderDay(date, lessons, day === 0)}
          </DaySection>,
        );
      }
    });

    pushCurrentGroup();

    return days;
  }

  renderDay(date: Date, lessons: ColoredLesson[], isToday: boolean) {
    const dayInfo = NUSModerator.academicCalendar.getAcadWeekInfo(date);

    // If it is a day with no lessons
    if (!lessons.length) {
      return <p>You have no lessons today</p>;
    }

    // If the lesson rendered is today, manage the next lesson marker and the
    // card that shows before the first lesson
    let nextLessonMarker = null;
    let beforeFirstLessonCard = null;

    if (isToday) {
      // Don't show any lessons in the past, and add the current time marker
      const currentTime = getCurrentHours() * 100 + getCurrentMinutes();
      // eslint-disable-next-line no-param-reassign
      lessons = lessons.filter((lesson) => parseInt(lesson.EndTime, 10) > currentTime);

      const nextLesson = minBy(lessons, (lesson) => lesson.StartTime);

      // If there is at least one lesson remaining today...
      if (nextLesson) {
        const marker = <p className={styles.nowMarker}>{formatTime(currentTime)}</p>;

        if (isLessonOngoing(nextLesson, currentTime)) {
          // If the next lesson is still ongoing, we put the marker inside the next lesson
          nextLessonMarker = marker;
        } else {
          // Otherwise add a new card before the next lesson
          beforeFirstLessonCard = (
            <BeforeLessonCard
              currentTime={this.props.currentTime}
              nextLesson={nextLesson}
              marker={marker}
            />
          );
        }
      } else {
        return <p>You have no lessons left today</p>;
      }
    }

    return (
      <Fragment>
        {beforeFirstLessonCard}
        <DayEvents
          lessons={lessons}
          date={date}
          dayInfo={dayInfo}
          marker={nextLessonMarker}
          openLesson={this.state.openLesson}
          onOpenLesson={this.onOpenLesson}
        />
      </Fragment>
    );
  }

  render() {
    return (
      <div className="page-container">
        <Title>Today</Title>

        <CorsNotification />

        <Announcements />

        <RefreshPrompt />

        {this.groupLessons()}

        <p className={styles.attribution}>
          Icon made by <ExternalLink href="https://www.freepik.com/">Freepik</ExternalLink> from{' '}
          <ExternalLink href="https://www.flaticon.com/">www.flaticon.com</ExternalLink>
        </p>
      </div>
    );
  }
}

const TodayContainerWithTimer = withTimer(TodayContainerComponent);

const ConnectedTimetableContainer = connect((state) => {
  const modules = state.moduleBank.modules;
  const semester = config.semester;
  const { timetable, colors } = getSemesterTimetable(semester, state.timetables);
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);

  return {
    colors,
    timetableWithLessons,
  };
})(TodayContainerWithTimer);

export default ConnectedTimetableContainer;
