// @flow

import React, { PureComponent } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

import type { ModuleCode, Semester } from 'types/modules';
import type { PlannerModuleInfo } from 'types/views';
import config from 'config';
import { getModuleExamDate, renderMCs } from 'utils/modules';
import {
  getDroppableId,
  getModuleCredit,
  getModuleTitle,
  getSemesterName,
  getTotalMC,
} from 'utils/planner';
import PlannerModule from './PlannerModule';
import AddModule from './AddModule';
import styles from './PlannerSemester.scss';

type Props = {|
  +year: string,
  +semester: Semester,
  +modules: PlannerModuleInfo[],

  +showModuleMeta: boolean,
  +className?: string,

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
  +addCustomData: (moduleCode: ModuleCode) => void,
|};

function renderSemesterMeta(plannerModules: PlannerModuleInfo[]) {
  const moduleCredits = getTotalMC(plannerModules);

  return (
    <div className={styles.semesterMeta}>
      <p>
        {plannerModules.length} {plannerModules.length === 1 ? 'module' : 'modules'}
      </p>
      <p>{renderMCs(moduleCredits)}</p>
    </div>
  );
}

/**
 * Component for a single column of modules for a single semester
 */
export default class PlannerSemester extends PureComponent<Props> {
  static defaultProps = {
    showModuleMeta: true,
  };

  renderModule = (plannerModule: PlannerModuleInfo, index: number) => {
    const { year, semester, showModuleMeta } = this.props;
    const { moduleCode, moduleInfo, conflict } = plannerModule;

    const showExamDate = showModuleMeta && config.academicYear === year;

    return (
      <PlannerModule
        key={moduleCode}
        index={index}
        moduleCode={moduleCode}
        moduleTitle={getModuleTitle(plannerModule)}
        examDate={showExamDate && moduleInfo ? getModuleExamDate(moduleInfo, semester) : null}
        moduleCredit={showModuleMeta ? getModuleCredit(plannerModule) : null}
        conflict={conflict}
        removeModule={this.props.removeModule}
        addCustomData={this.props.addCustomData}
      />
    );
  };

  render() {
    const { year, semester, modules, showModuleMeta } = this.props;
    const droppableId = getDroppableId(year, semester);

    return (
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            className={classnames(styles.semester, this.props.className, {
              [styles.emptyList]: modules.length === 0,
              [styles.dragOver]: snapshot.isDraggingOver,
            })}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {modules.map(this.renderModule)}

            {provided.placeholder}

            {modules.length === 0 && (
              <p className={styles.emptyListMessage}>
                Drop module here to add to {getSemesterName(semester)}
              </p>
            )}

            {showModuleMeta && modules.length > 0 && renderSemesterMeta(modules)}

            <div className={styles.addModule}>
              <AddModule
                year={year}
                semester={semester}
                onAddModule={(moduleCode) => this.props.addModule(moduleCode, year, +semester)}
              />
            </div>
          </div>
        )}
      </Droppable>
    );
  }
}
