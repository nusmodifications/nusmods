// @flow

import React, { PureComponent, Fragment, type Node } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { range, minBy } from 'lodash';
import classnames from 'classnames';
import NUSModerator from 'nusmoderator';
import Raven from 'raven-js';
import {
  isSameDay,
  addDays,
  formatDistanceStrict,
  differenceInHours,
  differenceInCalendarDays,
} from 'date-fns';

import type { ColoredLesson, Lesson } from 'types/modules';
import type { SemTimetableConfigWithLessons } from 'types/timetables';
import type { ColorMapping } from 'types/reducers';
import { DaysOfWeek } from 'types/modules';

import {
  getStartTimeAsDate,
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
  isLessonOngoing,
  timetableLessonsArray,
} from 'utils/timetables';
import Title from 'views/components/Title';
import CorsNotification from 'views/components/cors-info/CorsNotification';
import Announcements from 'views/components/notfications/Announcements';
import RefreshPrompt from 'views/components/notfications/RefreshPrompt';
import { venuePage } from 'views/routes/paths';
import { getSemesterTimetable } from 'reducers/timetables';
import * as weatherAPI from 'apis/weather';
import config from 'config';
/** @var {string[]} */
import holidays from 'data/holidays.json';
import withTimer, { type TimerData } from 'views/hocs/withTimer';
import { formatTime, getCurrentHours, getCurrentMinutes, getDayIndex } from 'utils/timify';
import DayEvents from './DayEvents';
import DayHeader from './DayHeader';
import styles from './TodayContainer.scss';

type Props = {|
  ...TimerData,

  timetableWithLessons: SemTimetableConfigWithLessons,
  colors: ColorMapping,
|};

type State = {
  // Mapping of number of days from today to the weather forecast for that day
  // with zero being today
  weather: { [string]: string },
};

const EMPTY_ARRAY = [];

const freeRoomMessage = (
  <Fragment>
    Need help finding a free classroom to study in? Check out our{' '}
    <Link to={venuePage()}>free room finder</Link>.
  </Fragment>
);

function getDayName(date: Date, diffInDays: number): string {
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  }

  return DaysOfWeek[getDayIndex(date)];
}

export class TodayContainerComponent extends PureComponent<Props, State> {
  state: State = {
    weather: {},
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

  renderBeforeNextLessonCard(nextLesson: Lesson, marker: Node) {
    const nextLessonDate = getStartTimeAsDate(nextLesson);
    const hoursTillNextLesson = differenceInHours(nextLessonDate, this.props.currentTime);

    let comment = null;

    const currentHour = this.props.currentTime.getHours();
    if (hoursTillNextLesson < 1) {
      comment = <p>Better get a move on to your next class! {freeRoomMessage}</p>;
    } else if (currentHour < 7 || currentHour >= 22) {
      // Why are you up right now?
      comment = <p>Why not go get some sleep?</p>;
    } else {
      comment = <p>Remember to take breaks when studying. {freeRoomMessage}</p>;
    }

    return (
      <div className={styles.lesson}>
        <div className={styles.lessonTime}>
          <p />
          {marker}
          <p />
        </div>
        <div className={classnames(styles.card, styles.inBetweenClass)}>
          <p>
            You have <strong>{formatDistanceStrict(nextLessonDate, this.props.currentTime)}</strong>{' '}
            till the next class.
          </p>
          {comment}
        </div>
      </div>
    );
  }

  renderDay(date: Date, lessons: ColoredLesson[], isToday: boolean) {
    let nextLessonMarker = null;
    let beforeFirstLessonBlock = null;

    // Assume no lessons on public holidays
    if (holidays.some((holiday) => isSameDay(date, holiday))) {
      return <p>Happy holiday!</p>;
    }

    // If it is a weekend / a day with no lessons
    if (!lessons.length) {
      return date.getDay() === 0 || date.getDay() === 6 ? (
        <p>Enjoy your weekend!</p>
      ) : (
        <p>You have no lessons today</p>
      );
    }

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
          beforeFirstLessonBlock = this.renderBeforeNextLessonCard(nextLesson, marker);
        }
      } else {
        return <p>You have no lessons left today</p>;
      }
    }

    const dayInfo = NUSModerator.academicCalendar.getAcadWeekInfo(date);
    return (
      <Fragment>
        {beforeFirstLessonBlock}
        <DayEvents lessons={lessons} dayInfo={dayInfo} marker={nextLessonMarker} />
      </Fragment>
    );
  }

  render() {
    const { colors, currentTime } = this.props;

    const timetableLessons: Lesson[] = timetableLessonsArray(this.props.timetableWithLessons);

    // Inject color into module
    const coloredTimetableLessons = timetableLessons.map((lesson: Lesson): ColoredLesson => ({
      ...lesson,
      colorIndex: colors[lesson.ModuleCode],
    }));

    const groupedLessons = groupLessonsByDay(coloredTimetableLessons);

    return (
      <div className="page-container">
        <Title>Today</Title>

        <CorsNotification />

        <Announcements />

        <RefreshPrompt />

        {range(7).map((i) => {
          const date = addDays(currentTime, i);
          const dayText = DaysOfWeek[getDayIndex(date)];
          const dayName = getDayName(date, i);

          return (
            <section className={styles.day} key={i}>
              <DayHeader date={date} dayName={dayName} forecast={this.state.weather[String(i)]} />
              {this.renderDay(date, groupedLessons[dayText] || EMPTY_ARRAY, i === 0)}
            </section>
          );
        })}
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
