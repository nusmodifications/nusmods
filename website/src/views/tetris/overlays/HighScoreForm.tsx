import { last, sortBy } from 'lodash';
import * as React from 'react';
import classnames from 'classnames';

import { addScoreData, getScoreData, HIGH_SCORE_COUNT, ScoreEntry } from './score';
import HighScoreTable from './HighScoreTable';
import styles from './HighScoreForm.scss';

type Props = {
  readonly score: number;
};

type State = {
  name: string;
  submitted: boolean;
};

export default class HighScoreForm extends React.PureComponent<Props, State> {
  state = {
    name: '',
    submitted: false,
  };

  onSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    addScoreData({
      name: this.state.name,
      score: this.props.score,
      time: Date.now(),
    });

    this.setState({ submitted: true });
  };

  renderForm() {
    return (
      <form className={styles.form} onSubmit={this.onSubmit}>
        <div className="input-group">
          <label className="sr-only" htmlFor="score-name">
            Name
          </label>
          <input
            required
            type="text"
            className={classnames('form-control form-control-sm')}
            value={this.state.name}
            placeholder="Gaben"
            onChange={(evt) => this.setState({ name: evt.target.value })}
          />
          <div className="input-group-append">
            <button type="submit" className="btn btn-sm btn-primary">
              Save!
            </button>
          </div>
        </div>
      </form>
    );
  }

  render() {
    const entries = getScoreData();
    const { score } = this.props;

    if (this.state.submitted) {
      return (
        <div>
          <p className="text-success">
            <strong>Score saved!</strong>
          </p>
          <HighScoreTable />
        </div>
      );
    }

    // Add the new score into the list and sort
    const entriesWithNewScore: [number, ScoreEntry | null][] = [
      ...entries.map((entry): [number, ScoreEntry] => [entry.score, entry]),
      [score, null],
    ];
    const sortedEntries = sortBy(entriesWithNewScore, ([entryScore]) => entryScore).reverse();

    // If your score comes in later than the other high scores, then sorry!
    const lastEntry = last(sortedEntries);
    if (sortedEntries.length > HIGH_SCORE_COUNT && lastEntry && !lastEntry[1]) {
      return null;
    }

    return (
      <div className={styles.highScore}>
        <table className={classnames(styles.table, 'table table-sm table-borderless')}>
          <thead>
            <tr>
              <th aria-label="Rank" />
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {sortedEntries.map(([entryScore, entry], index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td className={styles.nameCell}>{entry ? entry.name : this.renderForm()}</td>
                <td className={styles.scoreCell}>{entryScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
