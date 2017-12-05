// @flow

import React, { PureComponent } from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import classnames from 'classnames';
import { get } from 'lodash';

import type { State } from 'reducers';
import type { Module, Semester, ModuleCode } from 'types/modules';

import { AlertTriangle } from 'views/components/icons';
import { getModuleSemesterData } from 'utils/modules';
import { getSemesterModules } from 'utils/timetables';
import { intersperse } from 'utils/array';

import styles from './ModuleExamClash.scss';

const EMPTY_OBJECT = {};

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
export class ModuleExamDateComponent extends PureComponent<Props> {
  render() {
    const { modules, semester, examDate } = this.props;

    if (!examDate) return null;
    const clashes = modules.filter(module =>
      get(getModuleSemesterData(module, semester), 'ExamDate') === examDate);
    if (!clashes.length) return null;

    const usePlural = clashes.length > 1;
    const clashLinks = clashes.map(module => module.ModuleCode);

    return (
      <div className={classnames('text-danger', styles.alert)}>
        <AlertTriangle className={styles.icon} />
        <p className={styles.warning}>Your {usePlural ? 'modules' : 'module'} <strong>
          {intersperse(clashLinks, ',')}
        </strong> {usePlural ? 'have' : 'has'} exams at the same time</p>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, ownProps) => {
  const timetable = state.timetables[ownProps.semester] || EMPTY_OBJECT;
  const modulesMap = state.entities.moduleBank.modules;

  return {
    modules: getSemesterModules(timetable, modulesMap)
      .filter(module => module.ModuleCode !== ownProps.moduleCode),
  };
};

export default connect(mapStateToProps)(ModuleExamDateComponent);
