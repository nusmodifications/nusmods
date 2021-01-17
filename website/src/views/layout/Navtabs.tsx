import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Map } from 'react-feather';

import { timetablePage } from 'views/routes/paths';
import { preload as preloadToday } from 'views/today/TodayContainer';
import { preload as preloadVenues } from 'views/venues/VenuesContainer';
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
        to={{ pathname: '/modules', search: '?sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4' }}
      >
        <BookOpen />
        <span className={styles.title}>Modules</span>
      </NavLink>
      <NavLink {...tabProps} to="/venues" onMouseOver={preloadVenues} onFocus={preloadVenues}>
        <Map />
        <span className={styles.title}>Venues</span>
      </NavLink>
    </nav>
  );
};

export default Navtabs;
