// @flow

import React, { PureComponent, Fragment, type Node } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { range, minBy } from 'lodash';
import classnames from 'classnames';
import NUSModerator from 'nusmoderator';
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
  weather: { [string]: string },
};

class TodayContainer extends PureComponent<Props, State> {
  state: State = {
    currentTime: new Date(),
    weather: {},
  };

  componentDidMount() {
    this.intervalId = setInterval(() => this.setState({ currentTime: new Date() }), 60 * 1000);

    weatherAPI
      .twoHour()
      .then((weather) => this.setState({ weather: { ...this.state.weather, '0': weather } }));

    weatherAPI
      .tomorrow()
      .then((weather) => this.setState({ weather: { ...this.state.weather, '1': weather } }));

    weatherAPI.fourDay().then((forecasts) => {
      forecasts.forEach((forecast) => {
        const days = differenceInCalendarDays(forecast.timestamp, this.state.currentTime);

        if (!this.state.weather[String(days)]) {
          this.setState({ weather: { ...this.state.weather, [days]: forecast.forecast } });
        }
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  intervalId;

  renderBeforeNextLessonCard(nextLesson: Lesson, marker: Node) {
    const nextLessonDate = getStartTimeAsDate(nextLesson);
    const hoursTillNextLesson = differenceInHours(nextLessonDate, new Date());

    let comment = null;
    if (hoursTillNextLesson <= 1) {
      comment = <p>Better get a move on to your next class!</p>;
    } else if (new Date().getHours() < 7) {
      // Why are you up right now?
      comment = <p>Why not go get some sleep?</p>;
    } else {
      comment = (
        <p>
          Remember to take breaks when studying. Need help finding a free classroom? Check out our{' '}
          <Link to={venuePage()}>free room finder</Link>.
        </p>
      );
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
            You have <strong>{formatDistanceStrict(nextLessonDate, this.state.currentTime)}</strong>{' '}
            till the next class.
          </p>
          {comment}
        </div>
      </div>
    );
  }

  renderDay(date: Date, lessons: ColoredLesson[], isToday: boolean) {
    let netLessonMarker = null;
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
          netLessonMarker = marker;
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
        <DayEvents key={date} lessons={lessons} dayInfo={dayInfo} marker={netLessonMarker} />
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
              <DayHeader date={date} dayName={dayName} forecast={this.state.weather[String(i)]} />
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
