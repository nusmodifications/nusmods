import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { get } from 'lodash';

import { Module, ModuleCode, Semester } from 'types/modules';

import { AlertTriangle } from 'react-feather';
import { getModuleSemesterData } from 'utils/modules';
import { getSemesterModules } from 'utils/timetables';
import { getSemesterTimetableLessons } from 'selectors/timetables';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import { State } from 'types/state';

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
export const ModuleExamClashComponent: React.FC<Props> = ({
  modules,
  moduleCode,
  semester,
  examDate,
}) => {
  if (!examDate) return null;

  const clashes = modules.filter(
    (module) =>
      // Exclude current module
      module.moduleCode !== moduleCode &&
      // And find modules with the same exam date
      get(getModuleSemesterData(module, semester), 'examDate') === examDate,
  );
  if (!clashes.length) return null;

  const useSingular = clashes.length === 1;

  return (
    <div className={classnames('text-danger', styles.alert)}>
      <AlertTriangle className={styles.icon} />
      <p className={styles.warning}>
        Your {useSingular ? 'module' : 'modules'}{' '}
        <LinkModuleCodes>{clashes.map((module) => module.moduleCode).join(', ')}</LinkModuleCodes>{' '}
        {useSingular ? 'has' : 'have'} exams at the same time
      </p>
    </div>
  );
};

export default connect((state: State, ownProps: OwnProps) => {
  const timetable = getSemesterTimetableLessons(state)(ownProps.semester);
  const modulesMap = state.moduleBank.modules;
  return { modules: getSemesterModules(timetable, modulesMap) };
})(React.memo(ModuleExamClashComponent));
