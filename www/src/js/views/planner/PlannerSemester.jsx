// @flow

import React, { PureComponent } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

import type { ModuleCode, Module, Semester } from 'types/modules';
import config from 'config';
import PlannerModule from './PlannerModule';
import AddModule from './AddModule';
import styles from './PlannerSemester.scss';

type Props = {|
  +year: string,
  +semester: Semester,
  +semesterModules: ModuleCode[],
  +modules: { [ModuleCode]: Module },

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

export default class PlannerSemester extends PureComponent<Props> {
  render() {
    const { year, semester, semesterModules, modules } = this.props;

    return (
      <div className={styles.semester}>
        <h3 className={styles.semesterHeader}>{config.semesterNames[+semester]}</h3>
        <Droppable droppableId={`${year}-${semester}`}>
          {(provided, snapshot) => (
            <div
              className={classnames(styles.moduleList, {
                [styles.emptyList]: semesterModules.length === 0,
              })}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {semesterModules.map((moduleCode, index) => (
                <PlannerModule
                  moduleCode={moduleCode}
                  module={modules[moduleCode]}
                  index={index}
                  key={moduleCode}
                />
              ))}
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
