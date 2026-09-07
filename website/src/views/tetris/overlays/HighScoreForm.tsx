import { Label } from 'components/ui/label';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from 'components/ui/table';
import { last, sortBy } from 'lodash-es';
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
  override state = {
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
          <Label className="sr-only" htmlFor="score-name">
            Name
          </Label>
          <Input
            required
            type="text"
            className={classnames('form-control form-control-sm')}
            value={this.state.name}
            placeholder="Gaben"
            onChange={(evt) => this.setState({ name: evt.target.value })}
          />
          <div className="input-group-append">
            <Button variant="default" size="sm" type="submit">
              Save!
            </Button>
          </div>
        </div>
      </form>
    );
  }

  override render() {
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
        <Table className={classnames(styles.table, 'table table-sm table-borderless')}>
          <TableHeader>
            <TableRow>
              <TableHead aria-label="Rank" />
              <TableHead>Name</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedEntries.map(([entryScore, entry], index) => (
              <TableRow key={index}>
                <TableHead>{index + 1}</TableHead>
                <TableCell className={styles.nameCell}>
                  {entry ? entry.name : this.renderForm()}
                </TableCell>
                <TableCell className={styles.scoreCell}>{entryScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
