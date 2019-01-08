// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { sortBy, toPairs } from 'lodash';

import type { ModuleCode, Semester } from 'types/modules';
import type { ModuleInfo } from 'types/views';
import config from 'config';
import { getSemesterName } from 'utils/planner';
import { Minus, Plus } from 'views/components/icons';
import PlannerSemester from './PlannerSemester';
import styles from './PlannerYear.scss';

type Props = {|
  +year: string,
  +semesters: { [Semester]: ModuleCode[] },

  +getModuleInfo: (moduleCode: ModuleCode, year: string, semester: Semester) => ?ModuleInfo,
  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

type State = {|
  +showSpecialSem: boolean,
|};

export default class PlannerYear extends PureComponent<Props, State> {
  state = {
    showSpecialSem: Boolean(this.props.semesters[3]) || Boolean(this.props.semesters[4]),
  };

  render() {
    const { year, semesters } = this.props;
    const { showSpecialSem } = this.state;

    // If showSpecialSem is enabled, we add in blank sem 3 and 4
    // for the user to drop modules onto
    const specialSem = showSpecialSem
      ? {
          /* eslint-disable no-useless-computed-key */
          [3]: [],
          [4]: [],
          /* eslint-enable */
        }
      : {};

    const sortedSemesters = sortBy(
      toPairs({
        ...specialSem,
        ...semesters,
      }),
      ([semester]) => semester,
    );

    const showSpecialSemToggle = !semesters[3] && !semesters[4];

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
            <div key={semester}>
              <h3 className={styles.semesterHeader}>{getSemesterName(+semester)}</h3>
              <PlannerSemester
                year={year}
                semester={+semester}
                modules={modules}
                getModuleInfo={this.props.getModuleInfo}
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
              Special Semesters
            </button>
          </p>
        )}
      </section>
    );
  }
}
