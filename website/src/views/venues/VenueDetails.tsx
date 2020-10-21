import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import classnames from 'classnames';
import { flatMap } from 'lodash';
import Link from 'views/routes/Link';

import { DayAvailability, TimePeriod, Venue } from 'types/venues';
import { Lesson } from 'types/timetables';

import { colorLessonsByKey } from 'utils/colors';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { ChevronLeft, ChevronRight } from 'react-feather';
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

export const VenueDetailsComponent: React.FC<Props> = (props) => {
  const arrangedLessons = () => {
    const lessons: Lesson[] = flatMap(props.availability, (day) => day.classes).map(
      (venueLesson) => ({
        ...venueLesson,
        title: '',
        isModifiable: true,
        venue: '',
      }),
    );

    const coloredLessons = colorLessonsByKey(lessons, 'moduleCode');
    return arrangeLessonsForWeek(coloredLessons);
  };

  const { venue, previous, next, matchBreakpoint, history } = props;

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
          lessons={arrangedLessons()}
          highlightPeriod={props.highlightPeriod}
          isVerticalOrientation={matchBreakpoint}
          onModifyCell={(lesson: Lesson) => {
            history.push(modulePage(lesson.moduleCode, lesson.title));
          }}
        />
      </div>
    </>
  );
};

const ResponsiveVenueDetails = makeResponsive(
  React.memo(VenueDetailsComponent),
  breakpointDown('lg'),
);
export default ResponsiveVenueDetails;
// export default withRouter(ResponsiveVenueDetails);
