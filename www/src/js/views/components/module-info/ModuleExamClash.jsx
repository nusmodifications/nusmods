// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { get } from 'lodash';

import type { State } from 'reducers';
import type { Module, Semester, ModuleCode } from 'types/modules';

import { modulePage } from 'views/routes/paths';
import { AlertTriangle } from 'views/components/icons';
import { getModuleSemesterData } from 'utils/modules';
import { getSemesterModules } from 'utils/timetables';
import { intersperse } from 'utils/array';
import { getSemesterTimetable } from 'reducers/timetables';

import styles from './ModuleExamClash.scss';

type Props = {
  moduleCode: ModuleCode,
  semester: Semester,
  examDate: ?string,
  modules: Module[],
};

/**
 * Shows a warning if the provided examDate clashes with the exam of any modules
 * that are already taken
 */
export class ModuleExamClashComponent extends PureComponent<Props> {
  render() {
    const { modules, moduleCode, semester, examDate } = this.props;

    if (!examDate) return null;

    const clashes = modules.filter(
      (module) =>
        // Exclude current module
        module.ModuleCode !== moduleCode &&
        // And find modules with the same exam date
        get(getModuleSemesterData(module, semester), 'ExamDate') === examDate,
    );
    if (!clashes.length) return null;

    const useSingular = clashes.length === 1;
    const clashLinks = clashes.map((module) => (
      <Link key={module.ModuleCode} to={modulePage(module.ModuleCode, module.ModuleTitle)}>
        {module.ModuleCode}
      </Link>
    ));

    return (
      <div className={classnames('text-danger', styles.alert)}>
        <AlertTriangle className={styles.icon} />
        <p className={styles.warning}>
          Your {useSingular ? 'module' : 'modules'} {intersperse(clashLinks, ', ')}{' '}
          {useSingular ? 'has' : 'have'} exams at the same time
        </p>
      </div>
    );
  }
}

export default connect((state: State, ownProps) => {
  const { timetable } = getSemesterTimetable(ownProps.semester, state.timetables);
  const modulesMap = state.moduleBank.modules;
  return { modules: getSemesterModules(timetable, modulesMap) };
})(ModuleExamClashComponent);
