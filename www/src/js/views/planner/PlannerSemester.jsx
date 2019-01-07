// @flow

import React, { PureComponent } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

import type { ModuleCode, Semester } from 'types/modules';
import type { ModuleInfo } from 'types/views';
import config from 'config';
import { getDroppableId } from 'utils/planner';
import PlannerModule from './PlannerModule';
import AddModule from './AddModule';
import styles from './PlannerSemester.scss';

type Props = {|
  +year: string,
  +semester: Semester,
  +semesterModules: ModuleCode[],
  +getModuleInfo: (moduleCode: ModuleCode, year: string, semester: Semester) => ?ModuleInfo,

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

export default class PlannerSemester extends PureComponent<Props> {
  render() {
    const { year, semester, semesterModules } = this.props;
    const droppableId = getDroppableId(year, semester);
    return (
      <div className={styles.semester}>
        <h3 className={styles.semesterHeader}>{config.semesterNames[+semester]}</h3>

        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              className={classnames(styles.moduleList, {
                [styles.emptyList]: semesterModules.length === 0,
                [styles.dragOver]: snapshot.isDraggingOver,
              })}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {semesterModules.map((moduleCode, index) => {
                const moduleInfo = this.props.getModuleInfo(moduleCode, year, semester);

                return (
                  <PlannerModule
                    key={moduleCode}
                    moduleCode={moduleCode}
                    index={index}
                    module={moduleInfo?.module}
                    conflicts={moduleInfo?.conflicts}
                    removeModule={() => this.props.removeModule(moduleCode)}
                  />
                );
              })}
              {provided.placeholder}
              {semesterModules.length === 0 && (
                <p className={styles.emptyListMessage}>
                  Drop module to add to {config.semesterNames[+semester]}
                </p>
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
