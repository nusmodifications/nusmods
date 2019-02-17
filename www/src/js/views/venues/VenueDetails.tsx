import * as React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import classnames from 'classnames';
import { flatMap } from 'lodash';

import { DayAvailability, Venue, VenueLesson, VenueSearchOptions } from 'types/venues';
import { Lesson } from 'types/modules';

import { colorLessonsByKey } from 'utils/colors';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { ChevronLeft, ChevronRight } from 'views/components/icons';
import Timetable from 'views/timetable/Timetable';
import makeResponsive from 'views/hocs/makeResponsive';
import { modulePage, venuePage } from 'views/routes/paths';
import Title from 'views/components/Title';
import { mergeDualCodedModules } from 'utils/venues';
import { breakpointDown } from 'utils/css';
import VenueLocation from './VenueLocation';

import styles from './VenueDetails.scss';
import { convertIndexToTime, SCHOOLDAYS } from "../../utils/timify";

type Props = RouteComponentProps & {
  readonly venue: Venue;
  readonly previous?: Venue | null;
  readonly next?: Venue | null;
  readonly availability: DayAvailability[];
  readonly searchedPeriod: VenueSearchOptions;

  readonly matchBreakpoint: boolean;
};

export class VenueDetailsComponent extends React.PureComponent<Props> {
  arrangedLessons() {
    const lessons = flatMap(
      this.props.availability,
      (day): VenueLesson[] => mergeDualCodedModules(day.Classes),
    ).map((venueLesson) => ({ ...venueLesson, ModuleTitle: '', isModifiable: true }));

    const coloredLessons = colorLessonsByKey(lessons, 'ModuleCode');
    if (this.props.searchedPeriod !== undefined) {
      coloredLessons.push(this.makeSearchedPeriodLesson());
    }
    // @ts-ignore TODO: Fix this typing
    return arrangeLessonsForWeek(coloredLessons);
  }

  makeSearchedPeriodLesson() {
    const day = SCHOOLDAYS[this.props.searchedPeriod.day];
    console.log(this.props.searchedPeriod.time + this.props.searchedPeriod.duration);
    const startTime = convertIndexToTime(this.props.searchedPeriod.time * 2);
    const endTime = convertIndexToTime(2 * (this.props.searchedPeriod.time + this.props.searchedPeriod.duration));

    let freeTimePeriod: VenueLesson = {
      ClassNo: 'SEARCHED TIME PERIOD',
      DayText: day,
      EndTime: endTime,
      LessonType: '',
      ModuleCode: '',
      StartTime: startTime,
      WeekText: '',
    };
    let freeTimePeriodLesson = { ...freeTimePeriod, ModuleTitle: '', isModifiable: false, colorIndex: 3 };
    console.log(freeTimePeriodLesson);
    return freeTimePeriodLesson;
  }

  render() {
    const { venue, previous, next, matchBreakpoint, history } = this.props;
    return (
      <>
        <Title description={`NUS classroom timetable for ${venue}`}>{`${venue} - Venues`}</Title>

        <header className={styles.header}>
          <Link
            className={classnames('btn btn-link btn-svg', {
              disabled: !previous,
            })}
            to={{
              pathname: venuePage(previous),
              search: window.location.search,
            }}
          >
            <ChevronLeft /> {previous}
          </Link>
          <h1>{venue}</h1>
          <Link
            className={classnames('btn btn-link btn-svg', {
              disabled: !next,
            })}
            to={{
              pathname: venuePage(next),
              search: window.location.search,
            }}
          >
            {next} <ChevronRight />
          </Link>
        </header>

        <div className={styles.location}>
          <VenueLocation venue={venue} />
        </div>

        <div className={classnames(styles.timetable, { verticalMode: matchBreakpoint })}>
          <Timetable
            lessons={this.arrangedLessons()}
            isVerticalOrientation={matchBreakpoint}
            onModifyCell={(lesson: Lesson) => {
              history.push(modulePage(lesson.ModuleCode, lesson.ModuleTitle));
            }}
          />
        </div>
      </>
    );
  }
}

const ResponsiveVenueDetails = makeResponsive(VenueDetailsComponent, breakpointDown('lg'));
export default withRouter(ResponsiveVenueDetails);
