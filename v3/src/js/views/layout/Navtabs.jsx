// @flow
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Map, BookOpen, Settings } from 'views/components/icons/index';

import styles from './Navtabs.scss';

export const NAVTAB_HEIGHT = 48;

function Navtabs() {
  const tabProps = {
    className: styles.link,
    activeClassName: styles.linkActive,
    ariaCurrent: 'page',
  };

  return (
    <nav className={styles.nav}>
      <NavLink {...tabProps} to="/timetable">
        <Calendar className={styles.icon} />
        <span className={styles.title}>Timetable</span>
      </NavLink>
      <NavLink {...tabProps} to="/modules">
        <BookOpen className={styles.icon} />
        <span className={styles.title}>Modules</span>
      </NavLink>
      <NavLink {...tabProps} to="/venues">
        <Map className={styles.icon} />
        <span className={styles.title}>Venues</span>
      </NavLink>
      <NavLink {...tabProps} to="/settings">
        <Settings className={styles.icon} />
        <span className={styles.title}>Settings</span>
      </NavLink>
    </nav>
  );
}

export default Navtabs;
