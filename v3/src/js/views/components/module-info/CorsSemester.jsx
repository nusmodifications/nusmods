// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { groupBy } from 'lodash';

import type { SemesterStats } from 'types/views';

import { PlusSquare, MinusSquare } from 'views/components/icons';
import CorsRound from './CorsRound';
import CorsSummary from './CorsSummary';
import CorsQuota from './CorsQuota';
import styles from './CorsStats.scss';

type Props = {
  semester: string,
  stats: SemesterStats,
};

type State = {
  showDetails: boolean,
}

export default class CorsSemester extends PureComponent<Props, State> {
  state: State = {
    showDetails: false,
  };

  render() {
    const { semester, stats } = this.props;
    const { showDetails } = this.state;

    const roundStats = groupBy(stats.stats, ({ Round }) => Round.charAt(0));
    const showFaculty = stats.faculties.size > 1;

    return (
      <div key={semester} className={styles.semester}>
        <h3 className={styles.semHeading}>{semester}</h3>

        <div className={classnames('row', styles.summary)}>
          <div className="col-sm-3">
            <h4>Quota</h4>
            <p>
              <CorsQuota
                bidders={stats.bids}
                quota={stats.quota}
              />
            </p>
          </div>

          <div className="col-sm-9">
            <h4>Minimum Winning Bids</h4>

            <CorsSummary summary={stats.summary} />
          </div>
        </div>

        <button
          className={classnames('btn', 'btn-link', styles.detailsHeading)}
          onClick={() => this.setState({ showDetails: !showDetails })}
        >
          {showDetails ? <MinusSquare /> : <PlusSquare />} Detailed bidding information
        </button>

        {showDetails &&
          <div className={styles.details}>
            <div className="row">
              <div className="col-md">
                <h4 className={styles.roundHeading}>Round 1 <small>Program account only</small></h4>
                <CorsRound stats={roundStats[1]} showFaculty={showFaculty} />
              </div>
              <div className="col-md">
                <h4 className={styles.roundHeading}>Round 2 <small>Program and general account</small></h4>
                <CorsRound stats={roundStats[2]} showFaculty={showFaculty} />
              </div>
              <div className="col-md">
                <h4 className={styles.roundHeading}>Round 3 <small>All students</small></h4>
                <CorsRound stats={roundStats[3]} showFaculty={showFaculty} />
              </div>
            </div>
          </div>}
      </div>
    );
  }
}
