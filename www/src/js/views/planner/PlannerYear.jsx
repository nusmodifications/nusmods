// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { sortBy, toPairs } from 'lodash';

import type { ModuleCode, Semester } from 'types/modules';
import type { ModuleWithInfo } from 'types/views';
import config from 'config';
import { getSemesterName } from 'utils/planner';
import { Minus, Plus } from 'views/components/icons';
import PlannerSemester from './PlannerSemester';
import styles from './PlannerYear.scss';

type Props = {|
  +year: string,
  +semesters: { [Semester]: ModuleWithInfo[] },

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

type State = {|
  +showSpecialSem: boolean,
|};

export default class PlannerYear extends PureComponent<Props, State> {
  state = {
    // Always display Special Terms I and II if either one has modules
    showSpecialSem: this.hasSpecialTermModules(),
  };

  hasSpecialTermModules() {
    const { semesters } = this.props;
    return semesters[3].length > 0 || semesters[4].length > 0;
  }

  render() {
    const { year, semesters } = this.props;
    const { showSpecialSem } = this.state;

    // Only show the toggle if special terms are currently empty
    const showSpecialSemToggle = !this.hasSpecialTermModules();

    let sortedSemesters = sortBy(toPairs(semesters), ([semester]) => semester);
    if (!showSpecialSem) {
      sortedSemesters = sortedSemesters.filter(([semester]) => +semester <= 2);
    }

    return (
      <section
        key={year}
        className={classnames(styles.year, {
          [styles.currentYear]: year === config.academicYear,
        })}
      >
        <h2 className={styles.yearHeader}>{year}</h2>

        <div className={styles.semesters}>
          {sortedSemesters.map(([semester, modules]) => (
            <div className={styles.semesterWrapper} key={semester}>
              <h3 className={styles.semesterHeader}>{getSemesterName(+semester)}</h3>
              <PlannerSemester
                year={year}
                semester={+semester}
                modules={modules}
                className={styles.semester}
                addModule={this.props.addModule}
                removeModule={this.props.removeModule}
              />
            </div>
          ))}
        </div>

        {showSpecialSemToggle && (
          <p className={styles.specialSemToggle}>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => this.setState({ showSpecialSem: !showSpecialSem })}
            >
              {showSpecialSem ? <Minus /> : <Plus />}
              Special Term
            </button>
          </p>
        )}
      </section>
    );
  }
}
