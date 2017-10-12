// @flow
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Search, Settings } from 'views/components/icons/index';

import styles from './Navtabs.scss';

function Navtabs() {
  return (
    <nav className={styles.nav}>
      <NavLink className={styles.link} activeClassName={styles.linkActive} to="/timetable">
        <Calendar className={styles.icon} />
        <span className={styles.title}>Timetable</span>
      </NavLink>
      <NavLink className={styles.link} activeClassName={styles.linkActive} to="/modules">
        <Search className={styles.icon} />
        <span className={styles.title}>Browse</span>
      </NavLink>
      <NavLink className={styles.link} activeClassName={styles.linkActive} to="/settings">
        <Settings className={styles.icon} />
        <span className={styles.title}>Settings</span>
      </NavLink>
    </nav>
  );
}

export default Navtabs;
