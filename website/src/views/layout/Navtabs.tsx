import React, { memo } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { BookOpen, Calendar, Clock, Heart, Map, Settings, Star, Trello } from 'react-feather';

import { Semester } from 'types/modules';
import ExternalLink from 'views/components/ExternalLink';
import { timetablePage } from 'views/routes/paths';
import { preload as preloadVenues } from 'views/venues/VenuesContainer';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';
import { PreloadingNavLink } from 'views/routes/PreloadingLink';
import { State } from 'types/state';

import styles from './Navtabs.scss';

export const NAVTAB_HEIGHT = 48;

type Props = {
  activeSemester: Semester;
  beta: boolean;
};

const tabProps = {
  className: styles.link,
  activeClassName: styles.linkActive,
};

export const NavtabsComponent = memo<Props>(({ activeSemester, beta }) => (
  <nav className={styles.nav}>
    <PreloadingNavLink {...tabProps} to="/today">
      <Clock />
      <span className={styles.title}>Today</span>
    </PreloadingNavLink>
    <PreloadingNavLink {...tabProps} to={timetablePage(activeSemester)}>
      <Calendar />
      <span className={styles.title}>Timetable</span>
    </PreloadingNavLink>
    <PreloadingNavLink
      {...tabProps}
      to={{ pathname: '/modules', search: '?sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4' }}
    >
      <BookOpen />
      <span className={styles.title}>Modules</span>
    </PreloadingNavLink>
    <PreloadingNavLink
      {...tabProps}
      to="/venues"
      onMouseOver={preloadVenues}
      onFocus={preloadVenues}
    >
      <Map />
      <span className={styles.title}>Venues</span>
    </PreloadingNavLink>
    {beta && (
      <PreloadingNavLink
        {...tabProps}
        className={classnames(tabProps.className, styles.hiddenOnMobile)}
        to="/planner"
      >
        <Trello />
        <span className={styles.title}>Planner</span>
      </PreloadingNavLink>
    )}
    <PreloadingNavLink {...tabProps} to="/settings">
      <Settings />
      <span className={styles.title}>Settings</span>
    </PreloadingNavLink>
    <PreloadingNavLink
      {...tabProps}
      className={classnames(tabProps.className, styles.hiddenOnMobile)}
      onMouseOver={preloadContribute}
      onFocus={preloadContribute}
      to="/contribute"
    >
      <Star />
      <span className={styles.title}>Contribute</span>
    </PreloadingNavLink>
    <div className={styles.divider} />
    <ExternalLink
      className={classnames(tabProps.className, styles.hiddenOnMobile)}
      href="https://nuswhispers.com"
    >
      <Heart />
      <span className={styles.title}>Whispers</span>
    </ExternalLink>
  </nav>
));

const connectedNavtabs = connect((state: State) => ({
  activeSemester: state.app.activeSemester,
  beta: !!state.settings.beta,
}))(NavtabsComponent);

export default connectedNavtabs;
