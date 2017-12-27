// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, type ContextRouter } from 'react-router-dom';
import { capitalize } from 'lodash';
import qs from 'query-string';

import type { State } from 'reducers';
import config, { type CorsRound, type CorsPeriod } from 'config';
import { dismissCorsNotification } from 'actions/settings';
import { roundStart, roundEnd } from 'utils/cors';
import CloseButton from 'views/components/CloseButton';

import styles from './CorsNotification.scss';

type Props = {
  enabled: boolean,
  dismissedRounds: string[],

  dismissCorsNotification: string => void,

  ...ContextRouter,
};

const NOW = new Date();

export class CorsNotificationComponent extends PureComponent<Props> {
  currentTime() {
    const debugRound = qs.parse(this.props.location.search).round;

    // For manual testing - add ?round=1A (or other round names) to trigger the notification
    if (debugRound) {
      const round = config.corsSchedule.find(r => r.round === debugRound);
      if (round) return roundStart(round);
    }

    return NOW;
  }

  currentCorsRound(): ?CorsRound {
    return config.corsSchedule.find(round => roundEnd(round) > this.currentTime());
  }

  currentPeriod(round: CorsRound): ?CorsPeriod {
    return round.periods.find(period => period.endDate > this.currentTime());
  }

  render() {
    const { enabled, dismissedRounds } = this.props;

    // User has disabled CORS notification globally
    if (!enabled) return null;

    const round = this.currentCorsRound();

    // CORS bidding is over - don't show anything
    if (!round) return null;
    // User has dismissed this round of CORS notifications
    if (dismissedRounds.includes(round.round)) return null;

    const period = this.currentPeriod(round);
    if (!period) return null; // Shouldn't happen

    const isRoundOpen = this.currentTime() >= period.startDate;
    return (
      <div className={styles.wrapper}>
        <a href="https://myaces.nus.edu.sg/cors/StudentLogin" target="_blank" rel="noopener noreferrer">
          <div className={styles.notification}>
            {isRoundOpen ? 'Current' : 'Next'} CORS round: <strong>{round.round} ({capitalize(period.type)})</strong>
            {isRoundOpen ? ' till' : ' at'} <br />
            <strong>{isRoundOpen ? period.end : period.start}</strong>
          </div>
        </a>

        <CloseButton
          className={styles.close}
          onClick={() => this.props.dismissCorsNotification(round.round)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  enabled: state.settings.corsNotification.enabled,
  dismissedRounds: state.settings.corsNotification.dismissed,
});

const withStoreCorsNotification = connect(mapStateToProps, { dismissCorsNotification })(CorsNotificationComponent);
const CorsNotification = withRouter(withStoreCorsNotification);
export default CorsNotification;
