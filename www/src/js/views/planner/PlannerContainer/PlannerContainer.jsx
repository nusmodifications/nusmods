// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { map, sortBy, toPairs, min, max } from 'lodash';
import { DragDropContext } from 'react-beautiful-dnd';

import type { AcadYearModules } from 'types/reducers';
import type { Module, ModuleCode, Semester } from 'types/modules';

import { addAcadYear, subtractAcadYear } from 'utils/modules';
// import { getTimetableModules } from 'utils/timetables';
import {
  addPlannerYear,
  addPlannerModule,
  movePlannerModule,
  removePlannerModule,
} from 'actions/planner';
import { getAcadYearModules } from 'selectors/planner';
import config from 'config';
import Title from 'views/components/Title';
import PlannerSemester from '../PlannerSemester';
import styles from './PlannerContainer.scss';

export type Props = {|
  +plannerModules: AcadYearModules,
  +modules: { [ModuleCode]: Module },

  +addYear: (year: string) => void,
  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +moveModule: (moduleCode: ModuleCode, year: string, semester: Semester, index: number) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

export class PlannerContainerComponent extends PureComponent<Props> {
  render() {
    const sortedModules: Array<[string, { [Semester]: ModuleCode[] }]> = sortBy(
      toPairs(this.props.plannerModules),
      (pairs) => pairs[0],
    );

    const years = Object.keys(this.props.plannerModules);
    const prevYear = subtractAcadYear(min(years));
    const nextYear = addAcadYear(max(years));

    return (
      <div className={styles.pageContainer}>
        <Title>Module Planner</Title>
        <header className={styles.header}>
          <h1>Module Planner</h1>
        </header>

        <DragDropContext
          onDragEnd={(evt) => {
            const { destination, draggableId } = evt;

            // No destination = drag and drop cancelled / dropped on invalid target
            if (!destination) return;

            const [year, semester] = destination.droppableId.split('-');
            this.props.moveModule(draggableId, year, +semester, destination.index);
          }}
        >
          <div className={styles.yearWrapper}>
            <button onClick={() => this.props.addYear(prevYear)}>Add Previous Year</button>
            {map(sortedModules, ([year, semesters]) => (
              <section
                key={year}
                className={classnames(styles.year, {
                  [styles.currentYear]: year === config.academicYear,
                })}
              >
                <h2 className={styles.yearHeader}>{year}</h2>
                <div className={styles.semesters}>
                  {map(semesters, (modules, semester) => (
                    <PlannerSemester
                      key={semester}
                      year={year}
                      semester={+semester}
                      semesterModules={modules}
                      modules={this.props.modules}
                      addModule={this.props.addModule}
                    />
                  ))}
                </div>
              </section>
            ))}
            <button onClick={() => this.props.addYear(nextYear)}>Add Next Year</button>
          </div>
        </DragDropContext>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const modules = getAcadYearModules(state.planner);
  // TODO: Enable this to also update the timetable
  // const timetableModules = getTimetableModules(state.timetables.lessons);

  return {
    plannerModules: {
      ...modules,
      // [config.academicYear]: timetableModules,
    },
  };
};

const PlannerContainer = connect(
  mapStateToProps,
  {
    addModule: addPlannerModule,
    moveModule: movePlannerModule,
    removeModule: removePlannerModule,
    addYear: addPlannerYear,
  },
)(PlannerContainerComponent);

export default PlannerContainer;
