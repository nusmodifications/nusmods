import { FC, memo, useCallback, useMemo } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'react-feather';
import classnames from 'classnames';
import { flatMap } from 'lodash';

import type { DayAvailability, TimePeriod, Venue } from 'types/venues';
import { State } from 'types/state';
import type { Lesson } from 'types/timetables';

import { colorLessonsByKey } from 'utils/colors';
import { arrangeLessonsForWeek } from 'utils/timetables';
import Title from 'views/components/Title';
import useMediaQuery from 'views/hooks/useMediaQuery';
import { modulePage, venuePage } from 'views/routes/paths';
import Timetable from 'views/timetable/Timetable';
import { breakpointDown } from 'utils/css';
import VenueLocation from './VenueLocation';

import styles from './VenueDetails.scss';

type Props = {
  venue: Venue;
  previous?: Venue | null;
  next?: Venue | null;
  availability: DayAvailability[];
  highlightPeriod?: TimePeriod;
};

const VenueDetailsComponent: FC<Props> = ({
  venue,
  previous,
  next,
  availability,
  highlightPeriod,
}) => {
  const numOfColors = useSelector(({ theme }: State) => theme.numOfColors);

  const arrangedLessons = useMemo(() => {
    const lessons: Lesson[] = flatMap(availability, (day) => day.classes).map((venueLesson) => ({
      ...venueLesson,
      title: '',
      isModifiable: true,
      venue: '',
    }));
    const coloredLessons = colorLessonsByKey(lessons, 'moduleCode', numOfColors);
    return arrangeLessonsForWeek(coloredLessons);
  }, [availability, numOfColors]);

  const history = useHistory();
  const navigateToLesson = useCallback(
    (lesson: Lesson) => history.push(modulePage(lesson.moduleCode, lesson.title)),
    [history],
  );

  const narrowViewport = useMediaQuery(breakpointDown('lg'));

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

      <div className={classnames(styles.timetable, { verticalMode: narrowViewport })}>
        <Timetable
          lessons={arrangedLessons}
          highlightPeriod={highlightPeriod}
          isVerticalOrientation={narrowViewport}
          onModifyCell={navigateToLesson}
        />
      </div>
    </>
  );
};

export default memo(VenueDetailsComponent);
