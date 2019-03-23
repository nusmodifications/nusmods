import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { flatMap } from 'lodash';

import { DayAvailability, Venue } from 'types/venues';
import { Lesson } from 'types/lessons';
import { TimePeriod } from 'types/views';

import { colorLessonsByKey } from 'utils/colors';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { ChevronLeft, ChevronRight } from 'views/components/icons';
import Timetable from 'views/timetable/Timetable';
import makeResponsive from 'views/hocs/makeResponsive';
import { modulePage, venuePage } from 'views/routes/paths';
import Title from 'views/components/Title';
import { breakpointDown } from 'utils/css';
import VenueLocation from './VenueLocation';

import styles from './VenueDetails.scss';

type Props = RouteComponentProps & {
  readonly venue: Venue;
  readonly previous?: Venue | null;
  readonly next?: Venue | null;
  readonly availability: DayAvailability[];
  readonly highlightPeriod?: TimePeriod;

  readonly matchBreakpoint: boolean;
};

export class VenueDetailsComponent extends React.PureComponent<Props> {
  arrangedLessons() {
    const lessons = flatMap(this.props.availability, (day) => day.classes).map((venueLesson) => ({
      ...venueLesson,
      ModuleTitle: '',
      isModifiable: true,
    }));

    const coloredLessons = colorLessonsByKey(lessons, 'moduleCode');
    // @ts-ignore TODO: Fix this typing
    return arrangeLessonsForWeek(coloredLessons);
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
            highlightPeriod={this.props.highlightPeriod}
            isVerticalOrientation={matchBreakpoint}
            onModifyCell={(lesson: Lesson) => {
              history.push(modulePage(lesson.moduleCode, lesson.title));
            }}
          />
        </div>
      </>
    );
  }
}

const ResponsiveVenueDetails = makeResponsive(VenueDetailsComponent, breakpointDown('lg'));
export default withRouter(ResponsiveVenueDetails);
