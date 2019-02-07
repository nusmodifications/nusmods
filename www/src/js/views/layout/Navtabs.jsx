// @flow
import type { State } from 'reducers';
import type { Semester } from 'types/modules';

import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import classnames from 'classnames';

import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  MapIcon,
  TrelloIcon,
  SettingsIcon,
  StarIcon,
} from 'views/components/icons';
import ExternalLink from 'views/components/ExternalLink';
import Online from 'views/components/Online';
import { timetablePage } from 'views/routes/paths';
import { preload as preloadToday } from 'views/today/TodayContainer';
import { preload as preloadVenues } from 'views/venues/VenuesContainer';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';
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
  };

  return (
    <nav className={styles.nav}>
      {props.beta && (
        <NavLink {...tabProps} to="/today" onMouseOver={preloadToday} onFocus={preloadToday}>
          <ClockIcon />
          <span className={styles.title}>Today</span>
        </NavLink>
      )}
      <NavLink {...tabProps} to={timetablePage(props.activeSemester)}>
        <CalendarIcon />
        <span className={styles.title}>Timetable</span>
      </NavLink>
      <NavLink {...tabProps} to="/modules">
        <BookOpenIcon />
        <span className={styles.title}>Modules</span>
      </NavLink>
      <NavLink {...tabProps} to="/venues" onMouseOver={preloadVenues} onFocus={preloadVenues}>
        <MapIcon />
        <span className={styles.title}>Venues</span>
      </NavLink>
      {props.beta && (
        <NavLink
          {...tabProps}
          className={classnames(tabProps.className, styles.hiddenOnMobile)}
          to="/planner"
        >
          <TrelloIcon />
          <span className={styles.title}>Planner</span>
        </NavLink>
      )}
      <NavLink {...tabProps} to="/settings">
        <SettingsIcon />
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
      <NavLink
        {...tabProps}
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        onMouseOver={preloadContribute}
        onFocus={preloadContribute}
        to="/contribute"
      >
        <StarIcon />
        <span className={styles.title}>Contribute</span>
      </NavLink>
      <div className={styles.divider} />
      <ExternalLink
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        href="https://nuswhispers.com"
      >
        <HeartIcon />
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
