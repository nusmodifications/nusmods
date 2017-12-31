// @flow
import type { State } from 'reducers';
import type { Semester } from 'types/modules';

import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { withRouter, Link, NavLink } from 'react-router-dom';
import classnames from 'classnames';

import { Calendar, Heart, Map, BookOpen, Settings } from 'views/components/icons';
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
      <Link
        {...tabProps}
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        to="https://nuswhispers.com"
        target="_blank"
        rel="noreferrer noopener"
      >
        <Heart />
        <span className={styles.title}>Whispers</span>
      </Link>
      <NavLink {...tabProps} to="/settings">
        <Settings />
        <span className={styles.title}>Settings</span>
      </NavLink>
    </nav>
  );
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  activeSemester: state.app.activeSemester,
});

const connectedNavtabs = connect(mapStateToProps)(NavtabsComponent);
export default withRouter(connectedNavtabs);
