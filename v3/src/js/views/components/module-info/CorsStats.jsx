// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { map, size } from 'lodash';

import type { BiddingStat } from 'types/modules';
import type { SemesterStats } from 'types/views';
import { analyseStats } from 'utils/cors';
import { GENERAL_ACCOUNT, NEW_STUDENT, RETURNING_STUDENT } from 'types/views';

// import CorsRound from './CorsRound';
import styles from './CorsStats.scss';

type Props = {
  stats: BiddingStat[],
};

const STUDENT_TYPE_LABELS = {
  [NEW_STUDENT]: 'Program (New Student)',
  [RETURNING_STUDENT]: 'Program (Returning Student)',
  [GENERAL_ACCOUNT]: 'General Account',
};

export default class CorsStats extends PureComponent<Props> {
  render() {
    // Reverse chronological order and only take the first three
    const semesterStats = analyseStats(this.props.stats);

    return (
      <div>{map(semesterStats, (semesterStat: SemesterStats, semester: string) => {
        // const roundStats = groupBy(semesterStat.stats, stats => stats.Round.charAt(0));

        return (
          <div key={semester} className={styles.semester}>
            <h3 className={styles.semHeading}>{semester}</h3>

            <div className={classnames('row', styles.summary)}>
              <div className="col-sm-3">
                <h4>Quota</h4>
                <p>{semesterStat.bids} / {semesterStat.quota}</p>
              </div>

              <div className="col-sm-9">
                <h4>Minimum Bids</h4>

                {map(semesterStat.summary, (facultyStats, name) => (
                  <div key={name}>
                    {size(semesterStat.summary) > 1 && <h5 className={styles.facultyHeading}>{name}</h5>}
                    <div className="row">
                      {map(facultyStats, ({ minBid, round }, type) => (
                        <div key={type} className="col-4">
                          <h6 className={styles.typeHeading}>{STUDENT_TYPE_LABELS[type]}</h6>
                          <p><strong className={styles.minBid}>{minBid}</strong> {minBid === 1 ? 'point' : 'points'}
                            <span className={styles.roundInfo}>Round {round}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/*
            <h3>Detailed bidding stats</h3>
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
            */}
          </div>
        );
      })}</div>
    );
  }
}
