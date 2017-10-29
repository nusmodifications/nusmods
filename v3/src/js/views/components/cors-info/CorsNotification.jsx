// @flow

import React, { PureComponent } from 'react';
import { capitalize } from 'lodash';

import config, { type CorsRound } from 'config';
import { roundEnd } from 'utils/cors';

import styles from './CorsNotification.scss';

type Props = {
  time: Date,
};

export default class CorsNotification extends PureComponent<Props> {
  static defaultProps = {
    time: new Date(),
  };

  currentCorsRound() {
    return config.corsSchedule.find(round => roundEnd(round) > this.props.time);
  }

  currentPeriod(round: CorsRound) {
    return round.periods.find(period => period.endDate > this.props.time);
  }

  render() {
    const { time } = this.props;
    const round = this.currentCorsRound();

    // CORS bidding is over - don't show anything
    if (!round) return null;
    const period = this.currentPeriod(round);
    if (!period) return null; // Shouldn't happen

    const isRoundOpen = time >= period.startDate;
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
