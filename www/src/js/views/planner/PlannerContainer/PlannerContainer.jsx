// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { flatMap, flatten, sortBy, sumBy, toPairs, values } from 'lodash';
import { DragDropContext, Droppable, type OnDragEndResponder } from 'react-beautiful-dnd';
import classnames from 'classnames';
import type { Module, ModuleCode, Semester } from 'types/modules';
import type { ModuleWithInfo, PlannerModulesWithInfo } from 'types/views';
import type { State as StoreState } from 'reducers';

import { MODULE_CODE_REGEX, renderMCs, subtractAcadYear } from 'utils/modules';
import {
  EXEMPTION_SEMESTER,
  EXEMPTION_YEAR,
  fromDroppableId,
  IBLOCS_SEMESTER,
  PLAN_TO_TAKE_SEMESTER,
  PLAN_TO_TAKE_YEAR,
} from 'utils/planner';
import { addPlannerModule, movePlannerModule, removePlannerModule } from 'actions/planner';
import { toggleFeedback } from 'actions/app';
import { fetchModule } from 'actions/moduleBank';
import { getAcadYearModules, getExemptions, getIBLOCs, getPlanToTake } from 'selectors/planner';
import { Settings, Trash } from 'views/components/icons';
import Title from 'views/components/Title';
import LoadingSpinner from 'views/components/LoadingSpinner';
import Modal from 'views/components/Modal';
import PlannerSemester from '../PlannerSemester';
import PlannerYear from '../PlannerYear';
import PlannerSettings from '../PlannerSettings';
import styles from './PlannerContainer.scss';

export type Props = {|
  +modules: PlannerModulesWithInfo,
  +exemptions: ModuleWithInfo[],
  +planToTake: ModuleWithInfo[],
  +iblocsModules: ModuleWithInfo[],
  +iblocs: boolean,

  // Actions
  +fetchModule: (ModuleCode) => Promise<Module>,
  +toggleFeedback: () => void,

  +addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void,
  +moveModule: (moduleCode: ModuleCode, year: string, semester: Semester, index: number) => void,
  +removeModule: (moduleCode: ModuleCode) => void,
|};

type State = {|
  +loading: boolean,
  +showSettings: boolean,
|};

const TRASH_ID = 'trash';

export class PlannerContainerComponent extends PureComponent<Props, State> {
  state = {
    loading: true,
    showSettings: false,
  };

  componentDidMount() {
    // TODO: Handle error
    const modules = [
      ...flatten(flatMap(this.props.modules, values)),
      ...this.props.exemptions,
      ...this.props.planToTake,
      ...this.props.iblocsModules,
    ];

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

  renderHeader() {
    const modules = [...this.props.iblocsModules, ...flatten(flatMap(this.props.modules, values))];
    const credits = sumBy(modules, (module) => +module.moduleInfo?.ModuleCredit || 0);
    const count = modules.length;

    return (
      <header className={styles.header}>
        <h1>
          Module Planner{' '}
          <button
            className="btn btn-sm btn-outline-success"
            type="button"
            onClick={this.props.toggleFeedback}
          >
            Beta - Send Feedback
          </button>
        </h1>

        <div>
          <button
            className="btn btn-svg btn-outline-primary"
            type="button"
            onClick={() => this.setState({ showSettings: true })}
          >
            <Settings className="svg" /> Settings
          </button>
          <p>
            {count} {count === 1 ? 'module' : 'modules'} / {renderMCs(credits)}
          </p>
        </div>
      </header>
    );
  }

  render() {
    // Don't render anything on initial load because every fetched module will
    // cause a re-render, which kills performance
    if (this.state.loading) {
      return <LoadingSpinner />;
    }

    const { modules, exemptions, planToTake, iblocs, iblocsModules } = this.props;

    // Sort acad years since acad years may not be inserted in display order
    const sortedModules: Array<[string, { [Semester]: ModuleWithInfo[] }]> = sortBy(
      toPairs(modules),
      (pairs) => pairs[0],
    );

    return (
      <div className={styles.pageContainer}>
        <Title>Module Planner</Title>

        {this.renderHeader()}

        <DragDropContext onDragEnd={this.onDropEnd}>
          <div className={styles.yearWrapper}>
            {iblocs && (
              <section>
                <h2 className={styles.modListHeaders}>iBLOCs</h2>
                <PlannerSemester
                  year={subtractAcadYear(sortedModules[0][0])}
                  semester={IBLOCS_SEMESTER}
                  modules={iblocsModules}
                  addModule={this.onAddModule}
                  removeModule={this.props.removeModule}
                  showConflicts={false}
                />
              </section>
            )}

            {sortedModules.map(([year, semesters], index) => (
              <PlannerYear
                key={year}
                name={`Year ${index + 1}`}
                year={year}
                semesters={semesters}
                addModule={this.onAddModule}
                removeModule={this.props.removeModule}
              />
            ))}
          </div>

          <div className={styles.moduleLists}>
            <section>
              <h2 className={styles.modListHeaders}>Exemptions</h2>
              <PlannerSemester
                year={EXEMPTION_YEAR}
                semester={EXEMPTION_SEMESTER}
                modules={exemptions}
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
                modules={planToTake}
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
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>

        <Modal
          isOpen={this.state.showSettings}
          onRequestClose={() => this.setState({ showSettings: false })}
          animate
        >
          <PlannerSettings />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  iblocs: state.planner.iblocs,

  modules: getAcadYearModules(state),
  exemptions: getExemptions(state),
  planToTake: getPlanToTake(state),
  iblocsModules: getIBLOCs(state),
});

const PlannerContainer = connect(
  mapStateToProps,
  {
    fetchModule,
    toggleFeedback,
    addModule: addPlannerModule,
    moveModule: movePlannerModule,
    removeModule: removePlannerModule,
  },
)(PlannerContainerComponent);

export default PlannerContainer;
