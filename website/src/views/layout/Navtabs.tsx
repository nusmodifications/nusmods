import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import {
  BookOpen,
  Calendar,
  Clock,
  Heart,
  Map,
  Settings,
  Star,
  Target,
  Trello,
} from 'react-feather';

import { showCPExTab } from 'featureFlags';
import ExternalLink from 'views/components/ExternalLink';
import { timetablePage } from 'views/routes/paths';
import { preload as preloadToday } from 'views/today/TodayContainer';
import { preload as preloadVenues } from 'views/venues/VenuesContainer';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';
import type { State } from 'types/state';

import styles from './Navtabs.scss';

export const NAVTAB_HEIGHT = 48;

const Navtabs: FC = () => {
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);

  const tabProps = {
    className: styles.link,
    activeClassName: styles.linkActive,
  };

  return (
    <nav className={styles.nav}>
      <NavLink {...tabProps} to="/today" onMouseOver={preloadToday} onFocus={preloadToday}>
        <Clock />
        <span className={styles.title}>Today</span>
      </NavLink>
      <NavLink {...tabProps} to={timetablePage(activeSemester)}>
        <Calendar />
        <span className={styles.title}>Timetable</span>
      </NavLink>
      <NavLink
        {...tabProps}
        to={{ pathname: '/courses', search: '?sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4' }}
      >
        <BookOpen />
        <span className={styles.title}>Courses</span>
      </NavLink>
      {showCPExTab && (
        <NavLink {...tabProps} to="/cpex">
          <Target />
          <span className={styles.title}>CPEx</span>
        </NavLink>
      )}
      <NavLink {...tabProps} to="/venues" onMouseOver={preloadVenues} onFocus={preloadVenues}>
        <Map />
        <span className={styles.title}>Venues</span>
      </NavLink>

      <NavLink
        {...tabProps}
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        to="/planner"
      >
        <Trello />
        <span className={styles.title}>Planner</span>
      </NavLink>

      <NavLink {...tabProps} to="/settings">
        <Settings />
        <span className={styles.title}>Settings</span>
      </NavLink>
      <NavLink
        {...tabProps}
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        onMouseOver={preloadContribute}
        onFocus={preloadContribute}
        to="/contribute"
      >
        <Star />
        <span className={styles.title}>Contribute</span>
      </NavLink>
      <div className={styles.divider} />
      <ExternalLink
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        href="https://nuswhispers.com"
      >
        <Heart />
        <span className={styles.title}>Whispers</span>
      </ExternalLink>
    </nav>
  );
};

export default Navtabs;
