// @flow

import React, { PureComponent } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';
import { sum } from 'lodash';

import type { ModuleCode, Semester } from 'types/modules';
import type { ModuleInfo } from 'types/views';
import config from 'config';
import { getModuleExamDate, renderMCs } from 'utils/modules';
import { getDroppableId, getSemesterName } from 'utils/planner';
import PlannerModule from './PlannerModule';
import AddModule from './AddModule';
import styles from './PlannerSemester.scss';

type Props = {|
  +year: string,
  +semester: Semester,
  +modules: ModuleCode[],
  +showConflicts: boolean,
  +showModuleMeta: boolean,

  +getModuleInfo: (moduleCode: ModuleCode, year: string, semester: Semester) => ?ModuleInfo,

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

export default class PlannerSemester extends PureComponent<Props> {
  static defaultProps = {
    showConflicts: true,
    showModuleMeta: true,
  };

  render() {
    const { year, semester, modules, showConflicts, showModuleMeta } = this.props;
    const droppableId = getDroppableId(year, semester);

    const modulesWithInfo = modules.map((moduleCode) => [
      moduleCode,
      this.props.getModuleInfo(moduleCode, year, semester),
    ]);

    return (
      <div className={styles.semester}>
        <h3 className={styles.semesterHeader}>{config.semesterNames[+semester]}</h3>

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
              {modulesWithInfo.map(([moduleCode, moduleInfo], index) => {
                const { conflicts, module } = moduleInfo || {};

                return (
                  <PlannerModule
                    key={moduleCode}
                    index={index}
                    moduleCode={moduleCode}
                    moduleTitle={module?.ModuleTitle}
                    examDate={showModuleMeta && module ? getModuleExamDate(module, semester) : null}
                    moduleCredit={showModuleMeta ? +module?.ModuleCredit : null}
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

              {showModuleMeta &&
                modulesWithInfo.length > 0 && (
                  <div className={styles.semesterMeta}>
                    <p>
                      {modulesWithInfo.length} {modulesWithInfo.length === 1 ? 'module' : 'modules'}
                    </p>
                    <p>
                      {renderMCs(
                        sum(
                          modulesWithInfo.map(
                            ([, moduleInfo]) => +moduleInfo?.module?.ModuleCredit || 0,
                          ),
                        ),
                      )}
                    </p>
                  </div>
                )}
            </div>
          )}
        </Droppable>

        <AddModule
          onAddModule={(moduleCode) => this.props.addModule(moduleCode, year, +semester)}
        />
      </div>
    );
  }
}
