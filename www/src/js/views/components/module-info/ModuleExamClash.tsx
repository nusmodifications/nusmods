import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { get } from 'lodash';

import { State } from 'reducers';
import { Module, Semester, ModuleCode } from 'types/modules';

import { AlertTriangle } from 'views/components/icons';
import { getModuleSemesterData } from 'utils/modules';
import { getSemesterModules } from 'utils/timetables';
import { getSemesterTimetable } from 'reducers/timetables';
import LinkModuleCodes from 'views/components/LinkModuleCodes';

import styles from './ModuleExamClash.scss';

type OwnProps = {
  moduleCode: ModuleCode;
  semester: Semester;
  examDate?: string;
};

type Props = OwnProps & {
  modules: Module[];
};

/**
 * Shows a warning if the provided examDate clashes with the exam of any modules
 * that are already taken
 */
export class ModuleExamClashComponent extends React.PureComponent<Props> {
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

    return (
      <div className={classnames('text-danger', styles.alert)}>
        <AlertTriangle className={styles.icon} />
        <p className={styles.warning}>
          Your {useSingular ? 'module' : 'modules'}{' '}
          <LinkModuleCodes>{clashes.map((module) => module.ModuleCode).join(', ')}</LinkModuleCodes>{' '}
          {useSingular ? 'has' : 'have'} exams at the same time
        </p>
      </div>
    );
  }
}

export default connect((state: State, ownProps: OwnProps) => {
  const { timetable } = getSemesterTimetable(ownProps.semester, state.timetables);
  const modulesMap = state.moduleBank.modules;
  return { modules: getSemesterModules(timetable, modulesMap) };
})(ModuleExamClashComponent);
