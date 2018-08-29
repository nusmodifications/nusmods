// @flow
import type { ComponentType } from 'react';
import React, { Fragment, PureComponent } from 'react';
import { Link, withRouter, type ContextRouter } from 'react-router-dom';
import classnames from 'classnames';
import { flatMap } from 'lodash';
import Raven from 'raven-js';

import type { DayAvailability, Venue, VenueLesson } from 'types/venues';
import type { Lesson } from 'types/modules';

import { colorLessonsByKey } from 'utils/colors';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { ChevronLeft, ChevronRight } from 'views/components/icons';
import Timetable from 'views/timetable/Timetable';
import makeResponsive from 'views/hocs/makeResponsive';
import { modulePage, venuePage } from 'views/routes/paths';
import Title from 'views/components/Title';
import { mergeDualCodedModules } from 'utils/venues';
import { breakpointDown } from 'utils/css';
import { retry } from 'utils/promise';

import styles from './VenueDetails.scss';

type Props = {
  ...ContextRouter,

  venue: Venue,
  previous?: ?Venue,
  next?: ?Venue,
  availability: DayAvailability[],

  matchBreakpoint: boolean,
};

type State = {
  VenueLocation: ComponentType<*>,
};

export class VenueDetailsComponent extends PureComponent<Props, State> {
  state = {
    VenueLocation: null,
  };

  componentDidMount() {
    retry(
      3,
      () => import(/* webpackChunkName: "venue" */ 'views/venues/VenueLocation'),
      (error) => error.message.includes('Loading chunk ') && window.navigator.onLine,
    )
      .then((module) => this.setState({ VenueLocation: module.default }))
      .catch((error) => {
        Raven.captureException(error);
      });
  }

  arrangedLessons() {
    const lessons = flatMap(this.props.availability, (day): VenueLesson[] =>
      mergeDualCodedModules(day.Classes),
    ).map((venueLesson) => ({ ...venueLesson, ModuleTitle: '', isModifiable: true }));

    const coloredLessons = colorLessonsByKey(lessons, 'ModuleCode');
    return arrangeLessonsForWeek(coloredLessons);
  }

  render() {
    const { venue, previous, next, matchBreakpoint, history } = this.props;
    const { VenueLocation } = this.state;

    return (
      <Fragment>
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

        {VenueLocation && <VenueLocation venue={venue} />}

        <div className={classnames(styles.timetable, { verticalMode: matchBreakpoint })}>
          <Timetable
            lessons={this.arrangedLessons()}
            isVerticalOrientation={matchBreakpoint}
            onModifyCell={(lesson: Lesson) => {
              history.push(modulePage(lesson.ModuleCode, lesson.ModuleTitle));
            }}
          />
        </div>
      </Fragment>
    );
  }
}

const ResponsiveVenueDetails = makeResponsive(VenueDetailsComponent, breakpointDown('lg'));
export default withRouter(ResponsiveVenueDetails);
