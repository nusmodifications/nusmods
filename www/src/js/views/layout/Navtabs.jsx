// @flow
import type { State } from 'reducers';
import type { Semester } from 'types/modules';

import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import classnames from 'classnames';

import { BookOpen, Calendar, Clock, Heart, Map, Trello, Settings } from 'views/components/icons';
import ExternalLink from 'views/components/ExternalLink';
import Online from 'views/components/Online';
import { timetablePage } from 'views/routes/paths';
import NavRefreshPrompt from './NavRefreshPrompt';

import styles from './Navtabs.scss';

export const NAVTAB_HEIGHT = 48;

type Props = {
  activeSemester: Semester,
  beta: boolean,
  promptRefresh: boolean,
};

export function NavtabsComponent(props: Props) {
  const tabProps = {
    className: styles.link,
    activeClassName: styles.linkActive,
    ariaCurrent: 'page',
  };

  return (
    <nav className={styles.nav}>
      {props.beta && (
        <NavLink {...tabProps} to="/today">
          <Clock />
          <span className={styles.title}>Today</span>
        </NavLink>
      )}
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
      {props.beta && (
        <NavLink {...tabProps} to="/planner">
          <Trello />
          <span className={styles.title}>Planner</span>
        </NavLink>
      )}
      <NavLink {...tabProps} to="/settings">
        <Settings />
        <span className={styles.title}>Settings</span>
        {props.promptRefresh && (
          <Online>
            <div
              className={classnames(styles.updateDot)}
              title="Update available"
              aria-label="Update available"
            />
          </Online>
        )}
      </NavLink>
      <div className={styles.divider} />
      <ExternalLink
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        href="https://nuswhispers.com"
      >
        <Heart />
        <span className={styles.title}>Whispers</span>
      </ExternalLink>
      {props.promptRefresh && (
        <Online>
          <NavRefreshPrompt />
        </Online>
      )}
    </nav>
  );
}

const connectedNavtabs = connect((state: State) => ({
  activeSemester: state.app.activeSemester,
  beta: state.settings.beta,
  promptRefresh: state.app.promptRefresh,
}))(NavtabsComponent);

export default withRouter(connectedNavtabs);
