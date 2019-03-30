import * as React from 'react';
import { connect } from 'react-redux';
import { flatMap, flatten, sortBy, toPairs, values } from 'lodash';
import { DragDropContext, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import classnames from 'classnames';

import { Module, ModuleCode, Semester } from 'types/modules';
import { PlannerModuleInfo, PlannerModulesWithInfo } from 'types/views';
import { MODULE_CODE_REGEX, renderMCs, subtractAcadYear } from 'utils/modules';
import {
  EXEMPTION_SEMESTER,
  EXEMPTION_YEAR,
  fromDroppableId,
  getTotalMC,
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
import { State as StoreState } from 'types/state';
import PlannerSemester from '../PlannerSemester';
import PlannerYear from '../PlannerYear';
import PlannerSettings from '../PlannerSettings';
import CustomModuleForm from '../CustomModuleForm';

import styles from './PlannerContainer.scss';

export type Props = {
  readonly modules: PlannerModulesWithInfo;
  readonly exemptions: PlannerModuleInfo[];
  readonly planToTake: PlannerModuleInfo[];
  readonly iblocsModules: PlannerModuleInfo[];
  readonly iblocs: boolean;

  // Actions
  readonly fetchModule: (moduleCode: ModuleCode) => Promise<Module>;
  readonly toggleFeedback: () => void;

  readonly addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void;
  readonly moveModule: (
    moduleCode: ModuleCode,
    year: string,
    semester: Semester,
    index: number,
  ) => void;
  readonly removeModule: (moduleCode: ModuleCode) => void;
};

type SemesterModules = { [semester: string]: PlannerModuleInfo[] };

type State = {
  readonly loading: boolean;
  readonly showSettings: boolean;
  // Module code is the module being edited. null means the modal is not open
  readonly showCustomModule: ModuleCode | null;
};

const TRASH_ID = 'trash';

export class PlannerContainerComponent extends React.PureComponent<Props, State> {
  state: State = {
    loading: true,
    showSettings: false,
    showCustomModule: null,
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

  onAddCustomData = (moduleCode: ModuleCode) =>
    this.setState({
      showCustomModule: moduleCode,
    });

  closeAddCustomData = () => this.setState({ showCustomModule: null });

  renderHeader() {
    const modules = [...this.props.iblocsModules, ...flatten(flatMap(this.props.modules, values))];
    const credits = getTotalMC(modules);
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
    const sortedModules: [string, SemesterModules][] = sortBy(
      toPairs<SemesterModules>(modules),
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
                  addCustomData={this.onAddCustomData}
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
                addCustomData={this.onAddCustomData}
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
                showModuleMeta={false}
                addCustomData={this.onAddCustomData}
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
                addCustomData={this.onAddCustomData}
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

        <Modal
          isOpen={!!this.state.showCustomModule}
          onRequestClose={this.closeAddCustomData}
          animate
        >
          {this.state.showCustomModule && (
            <CustomModuleForm
              moduleCode={this.state.showCustomModule}
              onFinishEditing={this.closeAddCustomData}
            />
          )}
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
