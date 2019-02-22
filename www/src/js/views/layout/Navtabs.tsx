import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import classnames from 'classnames';

import { State } from 'reducers';
import { Semester } from 'types/modules';
import { breakpointDown } from 'utils/css';
import {
  BookOpen,
  Calendar,
  Clock,
  Heart,
  Map,
  Trello,
  Settings,
  Star,
} from 'views/components/icons';
import makeResponsive, { WithBreakpoint } from 'views/hocs/makeResponsive';
import ExternalLink from 'views/components/ExternalLink';
import Online from 'views/components/Online';

import { timetablePage } from 'views/routes/paths';
import { preload as preloadToday } from 'views/today/TodayContainer';
import { preload as preloadVenues } from 'views/venues/VenuesContainer';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';

import NavRefreshPrompt from './NavRefreshPrompt';

import NavtabLink from './NavtabLink';
import styles from './Navtabs.scss';

export const NAVTAB_HEIGHT = 48;

type Props = RouteComponentProps &
  WithBreakpoint & {
    activeSemester: Semester;
    beta: boolean;
    promptRefresh: boolean;
  };

export function NavtabsComponent(props: Props) {
  const tabProps = {
    className: styles.link,
    activeClassName: styles.linkActive,
    hideLabel: props.matchBreakpoint,
  };

  return (
    <nav className={styles.nav}>
      {props.beta && (
        <NavtabLink {...tabProps} to="/today" onHover={preloadToday} label="Today">
          <Clock />
        </NavtabLink>
      )}

      <NavtabLink {...tabProps} to={timetablePage(props.activeSemester)} label="Timetable">
        <Calendar />
      </NavtabLink>

      <NavtabLink {...tabProps} to="/modules" label="Modules">
        <BookOpen />
      </NavtabLink>

      <NavtabLink {...tabProps} to="/venues" label="Venues" onHover={preloadVenues}>
        <Map />
      </NavtabLink>

      {props.beta && !props.matchBreakpoint && (
        <NavtabLink {...tabProps} to="/planner" label="Planner">
          <Trello />
        </NavtabLink>
      )}

      <NavtabLink {...tabProps} to="/settings" label="Settings">
        <Settings />
        {props.promptRefresh && (
          <Online>
            <div
              className={classnames(styles.updateDot)}
              title="Update available"
              aria-label="Update available"
            />
          </Online>
        )}
      </NavtabLink>

      {!props.matchBreakpoint && (
        <NavtabLink {...tabProps} to="/contribute" label="Contribute" onHover={preloadContribute}>
          <Star />
        </NavtabLink>
      )}

      <div className={styles.divider} />

      {!props.matchBreakpoint && (
        <ExternalLink
          className={classnames(tabProps.className, styles.hiddenOnMobile)}
          href="https://nuswhispers.com"
        >
          <Heart />
          <span className={styles.title}>Whispers</span>
        </ExternalLink>
      )}

      {props.promptRefresh && (
        <Online>
          <NavRefreshPrompt />
        </Online>
      )}
    </nav>
  );
}

const MemoizedNavtabs = React.memo(NavtabsComponent);

const NavtabsWithBreakpoint = makeResponsive(MemoizedNavtabs, breakpointDown('sm'));

const ConnectedNavtabs = connect((state: State) => ({
  activeSemester: state.app.activeSemester,
  beta: !!state.settings.beta,
  promptRefresh: state.app.promptRefresh,
}))(NavtabsWithBreakpoint);

export default withRouter(ConnectedNavtabs);
