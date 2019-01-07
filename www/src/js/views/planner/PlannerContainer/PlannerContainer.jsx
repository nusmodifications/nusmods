// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { map, sortBy, toPairs, min, max, each } from 'lodash';
import { DragDropContext } from 'react-beautiful-dnd';

import type { AcadYearModules } from 'types/reducers';
import type { Module, ModuleCode, Semester } from 'types/modules';
import type { ModuleInfo } from 'types/views';

import { addAcadYear, subtractAcadYear } from 'utils/modules';
import { EXEMPTION_SEMESTER, EXEMPTION_YEAR, fromDroppableId } from 'utils/planner';
import {
  addPlannerYear,
  addPlannerModule,
  movePlannerModule,
  removePlannerModule,
} from 'actions/planner';
import { fetchModule } from 'actions/moduleBank';
import { getAcadYearModules, getExemptions, getModuleInfo } from 'selectors/planner';
import config from 'config';
import Title from 'views/components/Title';
import PlannerSemester from '../PlannerSemester';
import styles from './PlannerContainer.scss';

export type Props = {|
  +plannerModules: AcadYearModules,
  +exemptions: ModuleCode[],

  +getModuleInfo: (moduleCode: ModuleCode, year: string, semester: Semester) => ?ModuleInfo,
  +fetchModule: (ModuleCode) => Promise<Module>,

  +addYear: (year: string) => void,
  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +moveModule: (moduleCode: ModuleCode, year: string, semester: Semester, index: number) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

export class PlannerContainerComponent extends PureComponent<Props> {
  componentDidMount() {
    each(this.props.plannerModules, (year) =>
      each(year, (semester) =>
        semester.forEach((moduleCode) => this.props.fetchModule(moduleCode)),
      ),
    );
  }

  onAddModule = (moduleCode: ModuleCode, year: string, semester: Semester) => {
    this.props.addModule(moduleCode, year, semester);
    // TODO: Handle error
    this.props.fetchModule(moduleCode);
  };

  render() {
    // Sort acad years since acad years may not be inserted in display order
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

            const [year, semester] = fromDroppableId(destination.droppableId);
            this.props.moveModule(draggableId, year, +semester, destination.index);
          }}
        >
          <div className={styles.yearWrapper}>
            <button onClick={() => this.props.addYear(prevYear)}>Add Previous Year</button>
            <section>
              <h2 className={styles.yearHeader}>Exemptions</h2>
              <PlannerSemester
                year={EXEMPTION_YEAR}
                semester={EXEMPTION_SEMESTER}
                semesterModules={this.props.exemptions}
                getModuleInfo={this.props.getModuleInfo}
                addModule={this.onAddModule}
                removeModule={this.props.removeModule}
                showConflicts={false}
                showModuleMeta={false}
              />
            </section>

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
                      getModuleInfo={this.props.getModuleInfo}
                      addModule={this.onAddModule}
                      removeModule={this.props.removeModule}
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

  return {
    getModuleInfo: getModuleInfo(state),
    exemptions: getExemptions(state.planner),
    plannerModules: {
      ...modules,
    },
  };
};

const PlannerContainer = connect(
  mapStateToProps,
  {
    fetchModule,
    addModule: addPlannerModule,
    moveModule: movePlannerModule,
    removeModule: removePlannerModule,
    addYear: addPlannerYear,
  },
)(PlannerContainerComponent);

export default PlannerContainer;
