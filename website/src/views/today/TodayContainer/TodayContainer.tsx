import * as React from 'react';
import { connect } from 'react-redux';
import { get, minBy, range } from 'lodash';
import NUSModerator, { AcadWeekInfo } from 'nusmoderator';
import classnames from 'classnames';
import {
  addDays,
  differenceInCalendarDays,
  getHours,
  getMinutes,
  isSameDay,
  isWeekend,
  parseISO,
} from 'date-fns';
import produce from 'immer';

import { DaysOfWeek } from 'types/modules';
import { Lesson, ColoredLesson, SemTimetableConfigWithLessons } from 'types/timetables';
import { ColorMapping } from 'types/reducers';
import { EmptyGroupType, SelectedLesson } from 'types/views';

import {
  groupLessonsByDay,
  hydrateSemTimetableWithLessons,
  isLessonAvailable,
  isLessonOngoing,
  timetableLessonsArray,
} from 'utils/timetables';
import { captureException } from 'utils/error';
import Title from 'views/components/Title';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import ExternalLink from 'views/components/ExternalLink';
import * as weatherAPI from 'apis/weather';
import config from 'config';
import withTimer, { TimerData } from 'views/hocs/withTimer';
import makeResponsive from 'views/hocs/makeResponsive';
import NoFooter from 'views/layout/NoFooter';
import MapContext from 'views/components/map/MapContext';
import { formatTime, getDayIndex } from 'utils/timify';
import { breakpointUp } from 'utils/css';
import { State as StoreState } from 'types/state';

import DayEvents from '../DayEvents';
import DayHeader from '../DayHeader';
import EmptyLessonGroup from '../EmptyLessonGroup';
import BeforeLessonCard from '../BeforeLessonCard';
import EventMap from '../EventMap';
import styles from './TodayContainer.scss';

const EMPTY_LESSONS: ColoredLesson[] = [];

// Map the semester property from AcadWeekInfo to semester number
const semesterNameMap: Record<string, number> = {
  'Semester 1': 1,
  'Semester 2': 2,
  'Special Sem 1': 3,
  'Special Sem 2': 4,
};

export type OwnProps = TimerData;

export type Props = OwnProps &
  Readonly<{
    timetableWithLessons: SemTimetableConfigWithLessons;
    colors: ColorMapping;
    matchBreakpoint: boolean;
  }>;

type State = Readonly<{
  // Mapping of number of days from today to the weather forecast for that day
  // with zero being today
  weather: { [key: string]: string };

  // Which lesson has an open venue map
  openLesson: SelectedLesson | null;

  isMapExpanded: boolean;
}>;

type DayGroup = {
  offset: number;
  type: EmptyGroupType;
  dates: Date[];
};

// Number of days to display
const DAYS = 7;

function getDayType(date: Date, weekInfo: AcadWeekInfo): EmptyGroupType {
  switch (weekInfo.type) {
    case 'Reading':
      return 'reading';
    case 'Examination':
      return 'examination';
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

export const DaySection: React.FC<
  Readonly<{
    children: React.ReactNode;
    date: Date | Date[];
    offset: number;
    forecast?: string;
  }>
> = (props) => (
  <section className={styles.day}>
    <DayHeader date={props.date} offset={props.offset} forecast={props.forecast} />
    {props.children}
  </section>
);
export class TodayContainerComponent extends React.PureComponent<Props, State> {
  state: State = {
    weather: {},
    openLesson: null,
    isMapExpanded: false,
  };

  componentDidMount() {
    weatherAPI
      .twoHour()
      .then((weather) => {
        if (!weather) return;
        this.setState((prevState) => ({ weather: { ...prevState.weather, '0': weather } }));
      })
      .catch(captureException);

    weatherAPI
      .tomorrow()
      .then((weather) => {
        if (!weather) return;
        this.setState((prevState) => ({ weather: { ...prevState.weather, '1': weather } }));
      })
      .catch(captureException);

    weatherAPI
      .fourDay()
      .then((forecasts) => {
        this.setState(
          produce((draft) => {
            forecasts.forEach((forecast) => {
              const days = differenceInCalendarDays(
                parseISO(forecast.timestamp),
                this.props.currentTime,
              );

              const key = String(days);
              if (!draft.weather[key]) {
                draft.weather[key] = forecast.forecast;
              }
            });
          }),
        );
      })
      .catch(captureException);
  }

  onToggleMapExpanded = (isMapExpanded: boolean) => {
    this.setState({ isMapExpanded });
  };

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
        colorIndex: colors[lesson.moduleCode],
      }),
    );

    const groupedLessons = groupLessonsByDay(coloredTimetableLessons);

    // Group empty days / non-instructional dates together
    const days: React.ReactNode[] = [];
    let currentGroup: DayGroup | null = null;

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

    range(DAYS).forEach((day) => {
      const date = addDays(currentTime, day);
      const dayOfWeek = DaysOfWeek[getDayIndex(date)];
      const weekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(date);
      const lessons = get(groupedLessons, dayOfWeek, EMPTY_LESSONS).filter((lesson) =>
        isLessonAvailable(lesson, date, weekInfo),
      );

      if (
        // Non-instructional week
        weekInfo.type !== 'Instructional' ||
        // Holiday during instructional week
        config.holidays.some((holiday) => isSameDay(date, holiday)) ||
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

    // In lg and above, we use the sidebar to show the map instead
    // of displaying inline inside the lesson, so the opened lesson is always null
    const openLesson = this.props.matchBreakpoint ? null : this.state.openLesson;

    // If it is a day with no lessons
    if (!lessons.length) {
      return <p>You have no lessons today</p>;
    }

    // If the lesson rendered is today, manage the next lesson marker and the
    // card that shows before the first lesson
    let nextLessonMarker = null;
    let beforeFirstLessonCard = null;

    if (isToday) {
      const { currentTime } = this.props;
      // Don't show any lessons in the past, and add the current time marker
      const time = getHours(currentTime) * 100 + getMinutes(currentTime);
      // eslint-disable-next-line no-param-reassign
      lessons = lessons.filter((lesson) => parseInt(lesson.endTime, 10) > time);

      const nextLesson = minBy(lessons, (lesson) => lesson.startTime);

      // If there is at least one lesson remaining today...
      if (nextLesson) {
        const marker = <p className={styles.nowMarker}>{formatTime(time)}</p>;

        if (isLessonOngoing(nextLesson, time)) {
          // If the next lesson is still ongoing, we put the marker inside the next lesson
          nextLessonMarker = marker;
        } else {
          // Otherwise add a new card before the next lesson
          beforeFirstLessonCard = (
            <BeforeLessonCard currentTime={currentTime} nextLesson={nextLesson} marker={marker} />
          );
        }
      } else {
        return <p>You have no lessons left today</p>;
      }
    }

    return (
      <>
        {beforeFirstLessonCard}
        <DayEvents
          lessons={lessons}
          date={date}
          dayInfo={dayInfo}
          marker={nextLessonMarker}
          openLesson={openLesson}
          onOpenLesson={this.onOpenLesson}
        />
      </>
    );
  }

  render() {
    return (
      <div className={styles.todayPage}>
        <Title>Today</Title>

        <div className={styles.schedule}>
          {this.groupLessons()}
          <p className={styles.attribution}>
            Icon made by <ExternalLink href="https://www.freepik.com/">Freepik</ExternalLink> from{' '}
            <ExternalLink href="https://www.flaticon.com/">www.flaticon.com</ExternalLink>
          </p>
        </div>

        {this.props.matchBreakpoint && (
          <>
            <NoFooter />
            <MapContext.Provider value={{ toggleMapExpanded: this.onToggleMapExpanded }}>
              <div
                className={classnames(styles.mapContainer, {
                  [styles.expanded]: this.state.isMapExpanded,
                })}
              >
                <EventMap venue={this.state.openLesson && this.state.openLesson.lesson.venue} />
              </div>
            </MapContext.Provider>
          </>
        )}
      </div>
    );
  }
}

export const mapStateToProps = (state: StoreState, ownProps: OwnProps) => {
  const { modules } = state.moduleBank;
  const lastDay = addDays(ownProps.currentTime, DAYS);
  const weekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(lastDay);
  const semester = semesterNameMap[weekInfo.sem];
  const timetable = getSemesterTimetableLessons(state)(semester);
  const colors = getSemesterTimetableColors(state)(semester);
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);

  return {
    colors,
    timetableWithLessons,
  };
};

const ConnectedTimetableContainer = connect(mapStateToProps)(TodayContainerComponent);

const TodayContainerWithTimer = withTimer(ConnectedTimetableContainer);
const ResponsiveTodayContainer = makeResponsive(TodayContainerWithTimer, breakpointUp('lg'));

export default ResponsiveTodayContainer;
