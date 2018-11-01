// @flow

import React, { PureComponent } from 'react';
import { entries } from 'lodash';

import type { BiddingStat, SemesterStats } from 'types/cors';
import { analyseStats } from 'utils/cors';
import CorsSemester from './CorsSemester';

type Props = {
  stats: BiddingStat[],
};

type State = {
  semestersShown: number,
};

export default class CorsStats extends PureComponent<Props, State> {
  state: State = {
    semestersShown: 3,
  };

  render() {
    const { semestersShown } = this.state;

    // Reverse chronological order
    const sortedStats: [string, SemesterStats][] = entries(
      analyseStats(this.props.stats),
    ).reverse();

    return (
      <div>
        {sortedStats.slice(0, semestersShown).map(([semester, semesterStat]) => (
          <CorsSemester key={semester} semester={semester} stats={semesterStat} />
        ))}

        {semestersShown < sortedStats.length && (
          <button
            onClick={() => this.setState({ semestersShown: semestersShown + 3 })}
            className="btn btn-outline-primary btn-block"
          >
            Show more semesters
          </button>
        )}
      </div>
    );
  }
}
