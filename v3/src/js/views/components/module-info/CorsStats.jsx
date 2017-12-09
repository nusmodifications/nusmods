// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { entries, groupBy } from 'lodash';

import type { BiddingStat } from 'types/modules';
import type { SemesterStats } from 'types/views';
import { analyseStats } from 'utils/cors';

import CorsRound from './CorsRound';
import CorsSummary from './CorsSummary';
import CorsQuota from './CorsQuota';
import styles from './CorsStats.scss';

type Props = {
  stats: BiddingStat[],
};

export default class CorsStats extends PureComponent<Props> {
  render() {
    // Reverse chronological order and only take the first three
    // $FlowFixMe Incorrect libdef for _.entries
    const sortedStats: [string, SemesterStats][] = entries(analyseStats(this.props.stats))
      .reverse().slice(0, 3);

    return (
      <div>{sortedStats.map(([semester, semesterStat]: [string, SemesterStats]) => {
        const roundStats = groupBy(semesterStat.stats, stats => stats.Round.charAt(0));

        return (
          <div key={semester} className={styles.semester}>
            <h3 className={styles.semHeading}>{semester}</h3>

            <div className={classnames('row', styles.summary)}>
              <div className="col-sm-3">
                <h4>Quota</h4>
                <p>
                  <CorsQuota
                    bidders={semesterStat.bids}
                    quota={semesterStat.quota}
                  />
                </p>
              </div>

              <div className="col-sm-9">
                <h4>Minimum Bids</h4>

                <CorsSummary summary={semesterStat.summary} />
              </div>
            </div>

            <div className={styles.details}>
              <div className="row">
                <div className="col-md">
                  <h4 className={styles.roundHeading}>Round 1 <small>Program account only</small></h4>
                  <CorsRound stats={roundStats[1]} />
                </div>
                <div className="col-md">
                  <h4 className={styles.roundHeading}>Round 2 <small>Program and general account</small></h4>
                  <CorsRound stats={roundStats[2]} />
                </div>
                <div className="col-md">
                  <h4 className={styles.roundHeading}>Round 3 <small>All students</small></h4>
                  <CorsRound stats={roundStats[3]} />
                </div>
              </div>
            </div>
          </div>
        );
      })}</div>
    );
  }
}
