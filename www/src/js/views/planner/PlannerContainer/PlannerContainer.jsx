// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { flatMap, values, flatten, max, min, sortBy, toPairs } from 'lodash';
import { DragDropContext, Droppable, type OnDragEndResponder } from 'react-beautiful-dnd';
import classnames from 'classnames';
import type { Module, ModuleCode, Semester } from 'types/modules';
import type { ModuleWithInfo, PlannerModulesWithInfo } from 'types/views';
import type { State as StoreState } from 'reducers';

import { addAcadYear, MODULE_CODE_REGEX, subtractAcadYear } from 'utils/modules';
import {
  EXEMPTION_SEMESTER,
  EXEMPTION_YEAR,
  fromDroppableId,
  PLAN_TO_TAKE_SEMESTER,
  PLAN_TO_TAKE_YEAR,
} from 'utils/planner';
import {
  addPlannerModule,
  addPlannerYear,
  movePlannerModule,
  removePlannerModule,
} from 'actions/planner';
import { fetchModule } from 'actions/moduleBank';
import { getAcadYearModules, getExemptions, getPlanToTake } from 'selectors/planner';
import { Trash } from 'views/components/icons';
import Title from 'views/components/Title';
import LoadingSpinner from 'views/components/LoadingSpinner';
import PlannerSemester from '../PlannerSemester';
import PlannerYear from '../PlannerYear';
import styles from './PlannerContainer.scss';

export type Props = {|
  +modules: PlannerModulesWithInfo,
  +exemptions: ModuleWithInfo[],
  +planToTake: ModuleWithInfo[],

  +fetchModule: (ModuleCode) => Promise<Module>,

  +addYear: (year: string) => void,
  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +moveModule: (moduleCode: ModuleCode, year: string, semester: Semester, index: number) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

type State = {|
  +loading: boolean,
|};

const TRASH_ID = 'trash';

function addYearLabel(year: string) {
  // Remove the 20 prefix from AY
  return year.replace(/20/g, '');
}

export class PlannerContainerComponent extends PureComponent<Props, State> {
  state = {
    loading: true,
  };

  componentDidMount() {
    // TODO: Handle error
    const modules = flatten(flatMap(this.props.modules, values));

    Promise.all(
      modules.map((module) =>
        this.props.fetchModule(module.moduleCode).catch(() => {
          // TODO: Handle error
        }),
      ),
    ).then(() => this.setState({ loading: false }));
  }

  onAddModule = (input: string, year: string, semester: Semester) => {
    // Extract everything that looks like a module code
    const moduleCodes = input.toUpperCase().match(MODULE_CODE_REGEX);

    if (moduleCodes) {
      moduleCodes.forEach((moduleCode) => {
        this.props.addModule(moduleCode, year, semester);
        // TODO: Handle error
        this.props.fetchModule(moduleCode);
      });
    }
  };

  onDropEnd: OnDragEndResponder = (evt) => {
    const { destination, draggableId } = evt;

    // No destination = drag and drop cancelled / dropped on invalid target
    if (!destination) return;

    if (destination.droppableId === TRASH_ID) {
      this.props.removeModule(draggableId);
    } else {
      const [year, semester] = fromDroppableId(destination.droppableId);
      this.props.moveModule(draggableId, year, +semester, destination.index);
    }
  };

  render() {
    // Don't render anything on initial load because every fetched module will
    // cause a re-render, which kills performance
    if (this.state.loading) {
      return <LoadingSpinner />;
    }

    // Sort acad years since acad years may not be inserted in display order
    const sortedModules: Array<[string, { [Semester]: ModuleWithInfo[] }]> = sortBy(
      toPairs(this.props.modules),
      (pairs) => pairs[0],
    );

    const years = Object.keys(this.props.modules);
    const prevYear = subtractAcadYear(min(years));
    const nextYear = addAcadYear(max(years));

    return (
      <div className={styles.pageContainer}>
        <Title>Module Planner</Title>

        <header className={styles.header}>
          <h1>Module Planner</h1>
        </header>

        <DragDropContext onDragEnd={this.onDropEnd}>
          <div className={styles.yearWrapper}>
            <button
              className={classnames(
                styles.addYearButton,
                styles.addPrevYear,
                'btn btn-outline-primary',
              )}
              onClick={() => this.props.addYear(prevYear)}
            >
              Add Plans For {addYearLabel(prevYear)}
            </button>

            {sortedModules.map(([year, semesters]) => (
              <PlannerYear
                key={year}
                year={year}
                semesters={semesters}
                addModule={this.onAddModule}
                removeModule={this.props.removeModule}
              />
            ))}
            <button
              className={classnames(styles.addYearButton, 'btn btn-outline-primary')}
              onClick={() => this.props.addYear(nextYear)}
            >
              Add Plans For {addYearLabel(nextYear)}
            </button>
          </div>

          <div className={styles.moduleLists}>
            <section>
              <h2 className={styles.modListHeaders}>Exemptions</h2>
              <PlannerSemester
                year={EXEMPTION_YEAR}
                semester={EXEMPTION_SEMESTER}
                modules={this.props.exemptions}
                addModule={this.onAddModule}
                removeModule={this.props.removeModule}
                showConflicts={false}
                showModuleMeta={false}
              />
            </section>

            <section>
              <h2 className={styles.modListHeaders}>Plan to Take</h2>
              <PlannerSemester
                year={PLAN_TO_TAKE_YEAR}
                semester={PLAN_TO_TAKE_SEMESTER}
                modules={this.props.planToTake}
                addModule={this.onAddModule}
                removeModule={this.props.removeModule}
                showConflicts={false}
              />
            </section>

            <Droppable droppableId={TRASH_ID}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={classnames(styles.trash, {
                    [styles.dragOver]: snapshot.isDraggingOver,
                  })}
                >
                  <div className={styles.trashMessage}>
                    <Trash />
                    <p>Drop modules here to remove them</p>
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  modules: getAcadYearModules(state),
  exemptions: getExemptions(state),
  planToTake: getPlanToTake(state),
});

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
