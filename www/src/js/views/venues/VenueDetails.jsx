// @flow

import React, { Fragment, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { flatMap } from 'lodash';

import type { DayAvailability, Venue, VenueLesson } from 'types/venues';

import { colorLessonsByKey } from 'utils/colors';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { ChevronLeft, ChevronRight } from 'views/components/icons';
import Timetable from 'views/timetable/Timetable';
import makeResponsive from 'views/hocs/makeResponsive';
import { venuePage } from 'views/routes/paths';
import Title from 'views/components/Title';
import { breakpointDown } from 'utils/css';

import styles from './VenueDetails.scss';

type Props = {
  venue: Venue,
  previous?: ?Venue,
  next?: ?Venue,
  availability: DayAvailability[],

  matchBreakpoint: boolean,
};

export class VenueDetailsComponent extends PureComponent<Props> {
  arrangedLessons() {
    const lessons = flatMap(this.props.availability, (day): VenueLesson[] => day.Classes).map(
      (venueLesson) => ({ ...venueLesson, ModuleTitle: '' }),
    );
    const coloredLessons = colorLessonsByKey(lessons, 'ModuleCode');
    return arrangeLessonsForWeek(coloredLessons);
  }

  render() {
    const { venue, previous, next, matchBreakpoint } = this.props;

    return (
      <Fragment>
        <Title>{`${venue} - Venues`}</Title>

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

        <div className={classnames(styles.timetable, { verticalMode: matchBreakpoint })}>
          <Timetable lessons={this.arrangedLessons()} isVerticalOrientation={matchBreakpoint} />
        </div>
      </Fragment>
    );
  }
}

export default makeResponsive(VenueDetailsComponent, breakpointDown('lg'));
