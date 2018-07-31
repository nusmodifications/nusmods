// @flow
import type { State } from 'reducers';
import type { Semester } from 'types/modules';

import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import classnames from 'classnames';

import { BookOpen, Calendar, Heart, Map, Settings } from 'views/components/icons';
import { timetablePage } from 'views/routes/paths';

import styles from './Navtabs.scss';

export const NAVTAB_HEIGHT = 48;

type Props = {
  activeSemester: Semester,
};

export function NavtabsComponent(props: Props) {
  const tabProps = {
    className: styles.link,
    activeClassName: styles.linkActive,
    ariaCurrent: 'page',
  };

  return (
    <nav className={styles.nav}>
      <NavLink {...tabProps} to={timetablePage(props.activeSemester)}>
        <Calendar />
        <span className={styles.title}>Timetable</span>
      </NavLink>
      <NavLink {...tabProps} to="/modules">
        <BookOpen />
        <span className={styles.title}>Modules</span>
      </NavLink>
      <NavLink {...tabProps} to="/venues">
        <Map />
        <span className={styles.title}>Venues</span>
      </NavLink>
      <NavLink {...tabProps} to="/settings">
        <Settings />
        <span className={styles.title}>Settings</span>
      </NavLink>
      <div className={styles.divider} />
      <a
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        href="https://nuswhispers.com"
        target="_blank"
        rel="noreferrer noopener"
      >
        <Heart />
        <span className={styles.title}>Whispers</span>
      </a>
    </nav>
  );
}

const connectedNavtabs = connect((state: State) => ({
  activeSemester: state.app.activeSemester,
}))(NavtabsComponent);
export default withRouter(connectedNavtabs);
