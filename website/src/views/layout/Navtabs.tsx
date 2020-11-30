import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { BookOpen, Calendar, Clock, Heart, Map, Settings, Star, Trello } from 'react-feather';

import { Semester } from 'types/modules';
import ExternalLink from 'views/components/ExternalLink';
import { timetablePage } from 'views/routes/paths';
import { preload as preloadToday } from 'views/today/TodayContainer';
import { preload as preloadVenues } from 'views/venues/VenuesContainer';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';
import { State } from 'types/state';

import styles from './Navtabs.scss';

export const NAVTAB_HEIGHT = 48;

type Props = RouteComponentProps & {
  activeSemester: Semester;
  beta: boolean;
};

export const NavtabsComponent: React.FC<Props> = (props) => {
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
      <NavLink {...tabProps} to={timetablePage(props.activeSemester)}>
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
      {props.beta && (
        <NavLink
          {...tabProps}
          className={classnames(tabProps.className, styles.hiddenOnMobile)}
          to="/planner"
        >
          <Trello />
          <span className={styles.title}>Planner</span>
        </NavLink>
      )}
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

const connectedNavtabs = connect((state: State) => ({
  activeSemester: state.app.activeSemester,
  beta: !!state.settings.beta,
}))(NavtabsComponent);

export default withRouter(connectedNavtabs);
