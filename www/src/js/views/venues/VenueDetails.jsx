// @flow

import React, { Fragment, PureComponent } from 'react';
import Helmet from 'react-helmet';
import classnames from 'classnames';
import { flatMap } from 'lodash';

import type { DayAvailability, Venue, VenueLesson } from 'types/venues';

import config from 'config';
import { colorLessonsByKey } from 'utils/colors';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { ChevronLeft, ChevronRight } from 'views/components/icons';
import Timetable from 'views/timetable/Timetable';
import makeResponsive from 'views/hocs/makeResponsive';
import { breakpointDown } from 'utils/css';

import styles from './VenueDetails.scss';

type Props = {
  venue: Venue,
  previous: ?Venue,
  next: ?Venue,
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
        <Helmet>
          <title>
            {venue} - Venues - {config.brandName}
          </title>
        </Helmet>

        <header className={styles.header}>
          <button className="btn btn-link" disabled={!previous}>
            <ChevronLeft /> {previous}
          </button>
          <h1>{venue}</h1>
          <button className="btn btn-link" disabled={!next}>
            <ChevronRight /> {next}
          </button>
        </header>

        <div className={classnames(styles.timetable, { verticalMode: matchBreakpoint })}>
          <Timetable lessons={this.arrangedLessons()} isVerticalOrientation={matchBreakpoint} />
        </div>
      </Fragment>
    );
  }
}

export default makeResponsive(VenueDetailsComponent, breakpointDown('lg'));
