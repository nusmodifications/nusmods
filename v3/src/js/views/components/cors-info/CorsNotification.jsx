// @flow

import React, { PureComponent } from 'react';
import { capitalize } from 'lodash';
import { withRouter, type ContextRouter } from 'react-router-dom';
import qs from 'query-string';

import config, { type CorsRound } from 'config';
import { roundStart, roundEnd } from 'utils/cors';

import styles from './CorsNotification.scss';

type Props = ContextRouter;

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

  currentCorsRound() {
    return config.corsSchedule.find(round => roundEnd(round) > this.currentTime());
  }

  currentPeriod(round: CorsRound) {
    return round.periods.find(period => period.endDate > this.currentTime());
  }

  render() {
    const round = this.currentCorsRound();

    // CORS bidding is over - don't show anything
    if (!round) return null;
    const period = this.currentPeriod(round);
    if (!period) return null; // Shouldn't happen

    const isRoundOpen = this.currentTime() >= period.startDate;
    return (
      <a href="https://myaces.nus.edu.sg/cors/StudentLogin" target="_blank" rel="noopener noreferrer">
        <div className={styles.wrapper}>
          {isRoundOpen ? 'Current' : 'Next'} CORS round: <strong>{round.round} ({capitalize(period.type)})</strong>
          {isRoundOpen ? ' till' : ' at'} <br />
          <strong>{isRoundOpen ? period.end : period.start}</strong>
        </div>
      </a>
    );
  }
}

const CorsNotification = withRouter(CorsNotificationComponent);
export default CorsNotification;
