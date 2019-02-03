// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { size, sortBy, toPairs, flatMap, values } from 'lodash';

import type { ModuleCode, Semester } from 'types/modules';
import type { PlannerModuleInfo } from 'types/views';
import config from 'config';
import { getTotalMC, getSemesterName } from 'utils/planner';
import { Minus, Plus } from 'views/components/icons';
import { renderMCs } from 'utils/modules';
import PlannerSemester from './PlannerSemester';
import styles from './PlannerYear.scss';

type Props = {|
  +name: string, // eg. iBLOCs, Year 1, etc.
  +year: string, // Actual academic year
  +semesters: { [Semester]: PlannerModuleInfo[] },

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
  +addCustomData: (moduleCode: ModuleCode) => void,
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
    return size(semesters[3]) > 0 || size(semesters[4]) > 0;
  }

  renderHeader() {
    const { year, name, semesters } = this.props;
    const modules = flatMap(semesters, values);
    const credits = getTotalMC(modules);
    const count = modules.length;

    return (
      <header className={styles.yearHeader}>
        <h2>
          {name} <span className={styles.acadYear}>{year}</span>
        </h2>
        <div className={styles.yearMeta}>
          <p>
            {count} {count === 1 ? 'module' : 'modules'}
          </p>
          <p>{renderMCs(credits)}</p>
        </div>
      </header>
    );
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
        {this.renderHeader()}

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
                addCustomData={this.props.addCustomData}
              />
            </div>
          ))}
        </div>

        {showSpecialSemToggle && (
          <div className={styles.specialSemToggle}>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => this.setState({ showSpecialSem: !showSpecialSem })}
            >
              {showSpecialSem ? <Minus /> : <Plus />}
              Special Term
            </button>
          </div>
        )}
      </section>
    );
  }
}
