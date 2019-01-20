// @flow
import { last, sortBy } from 'lodash';
import React, { PureComponent } from 'react';
import { addScoreData, getScoreData, HIGH_SCORE_COUNT } from './score';
import HighScoreTable from './HighScoreTable';

type Props = {
  score: number,
};

type State = {
  name: string,
  submitted: boolean,
};

export default class HighScoreForm extends PureComponent<Props, State> {
  state = {
    name: '',
    submitted: false,
  };

  onSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
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
      <form onSubmit={this.onSubmit}>
        <div className="input-group">
          <label className="sr-only" htmlFor="score-name">
            Name
          </label>
          <input
            required
            type="text"
            className="form-control"
            value={this.state.name}
            placeholder="Gaben"
            onChange={(evt) => this.setState({ name: evt.target.value })}
          />
          <div className="input-group-append">
            <button type="submit" className="btn btn-primary">
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
      return <HighScoreTable />;
    }

    const sortedEntries = sortBy(
      [...entries.map((entry) => [entry.score, entry]), [score, null]],
      ([entryScore]) => entryScore,
    ).reverse();

    // If your score comes in later than the other high scores, then sorry!
    if (sortedEntries.length > HIGH_SCORE_COUNT && !last(sortedEntries[1])) {
      return null;
    }

    return (
      <div>
        <table className="table table-sm table-borderless">
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {sortedEntries.map(([entryScore, entry], index) => (
              <tr key={index}>
                {entry ? <th>{entry.name}</th> : <th>{this.renderForm()}</th>}
                <td>{entryScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
