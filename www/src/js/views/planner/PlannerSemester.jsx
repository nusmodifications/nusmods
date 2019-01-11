// @flow

import React, { PureComponent } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';
import { sum } from 'lodash';

import type { ModuleCode, Semester } from 'types/modules';
import type { ModuleWithInfo } from 'types/views';
import config from 'config';
import { getModuleExamDate, renderMCs } from 'utils/modules';
import { getDroppableId, getSemesterName } from 'utils/planner';
import PlannerModule from './PlannerModule';
import AddModule from './AddModule';
import styles from './PlannerSemester.scss';

type Props = {|
  +year: string,
  +semester: Semester,
  +modules: ModuleWithInfo[],
  +showConflicts: boolean,
  +showModuleMeta: boolean,

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

function renderSemesterMeta(modulesWithInfo: ModuleWithInfo[]) {
  const moduleCredits = sum(
    modulesWithInfo.map(({ moduleInfo }) => +moduleInfo?.ModuleCredit || 0),
  );

  return (
    <div className={styles.semesterMeta}>
      <p>
        {modulesWithInfo.length} {modulesWithInfo.length === 1 ? 'module' : 'modules'}
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
    showConflicts: true,
    showModuleMeta: true,
  };

  render() {
    const { year, semester, modules, showConflicts, showModuleMeta } = this.props;
    const droppableId = getDroppableId(year, semester);

    return (
      <div className={styles.semester}>
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              className={classnames(styles.moduleList, {
                [styles.emptyList]: modules.length === 0,
                [styles.dragOver]: snapshot.isDraggingOver,
              })}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {modules.map((moduleWithInfo, index) => {
                const { moduleCode, moduleInfo, conflicts } = moduleWithInfo;
                const showExamDate = showModuleMeta && config.academicYear === year;

                return (
                  <PlannerModule
                    key={moduleCode}
                    index={index}
                    moduleCode={moduleCode}
                    moduleTitle={moduleInfo?.ModuleTitle}
                    examDate={
                      showExamDate && moduleInfo ? getModuleExamDate(moduleInfo, semester) : null
                    }
                    moduleCredit={showModuleMeta ? +moduleInfo?.ModuleCredit : null}
                    conflicts={showConflicts ? conflicts : null}
                    removeModule={() => this.props.removeModule(moduleCode)}
                  />
                );
              })}

              {provided.placeholder}

              {modules.length === 0 && (
                <p className={styles.emptyListMessage}>
                  Drop module to add to {getSemesterName(semester)}
                </p>
              )}

              {showModuleMeta && modules.length > 0 && renderSemesterMeta(modules)}
            </div>
          )}
        </Droppable>

        <AddModule
          year={year}
          semester={semester}
          onAddModule={(moduleCode) => this.props.addModule(moduleCode, year, +semester)}
        />
      </div>
    );
  }
}
