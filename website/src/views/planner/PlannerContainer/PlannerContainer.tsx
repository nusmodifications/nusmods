import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { flatMap, flatten, sortBy, toPairs, values } from 'lodash';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
  OnDragStartResponder,
} from 'react-beautiful-dnd';
import classnames from 'classnames';

import { Module, ModuleCode, ModuleType } from 'types/modules';
import {
  PlannerModulesWithInfo,
  PlannerModuleInfo,
  PlannerModuleSemester,
  AddModuleData,
} from 'types/planner';
import { renderMCs, subtractAcadYear } from 'utils/modules';
import {
  EXEMPTION_YEAR,
  fromDraggableId,
  fromDroppableId,
  getTotalMC,
  IBLOCS_SEMESTER,
  PLAN_TO_TAKE_YEAR,
} from 'utils/planner';
import {
  addPlannerModule,
  movePlannerModule,
  removePlannerModule,
  setPlaceholderModule,
} from 'actions/planner';
import { toggleFeedback } from 'actions/app';
import { fetchModule } from 'actions/moduleBank';
import { getAcadYearModules, getExemptions, getIBLOCs, getPlanToTake } from 'selectors/planner';
import { Settings, Trash } from 'react-feather';
import Title from 'views/components/Title';
import LoadingSpinner from 'views/components/LoadingSpinner';
import Modal from 'views/components/Modal';
import { State as StoreState } from 'types/state';
import PlannerSemester from '../PlannerSemester';
import PlannerYear from '../PlannerYear';
import PlannerSettings from '../PlannerSettings';
import CustomModuleForm from '../CustomModuleForm';

import styles from './PlannerContainer.scss';

export type Props = Readonly<{
  modules: PlannerModulesWithInfo;
  exemptions: PlannerModuleInfo[];
  planToTake: PlannerModuleInfo[];
  iblocsModules: PlannerModuleInfo[];
  iblocs: boolean;

  // Actions
  fetchModule: (moduleCode: ModuleCode) => Promise<Module>;
  toggleFeedback: () => void;

  addModule: (year: string, semester: PlannerModuleSemester, module: AddModuleData) => void;
  moveModule: (id: string, year: string, semester: PlannerModuleSemester, index: number) => void;
  removeModule: (id: string) => void;
  setPlaceholderModule: (id: string, moduleCode: ModuleCode) => void;
}>;

type SemesterModules = { [semester: string]: PlannerModuleInfo[] };

type State = {
  readonly loading: boolean;
  readonly showSettings: boolean;
  // Module code is the module being edited. null means the modal is not open
  readonly showCustomModule: ModuleCode | null;
  readonly draggedModuleType: ModuleType | null;
};

const TRASH_ID = 'trash';

export class PlannerContainerComponent extends PureComponent<Props, State> {
  state: State = {
    loading: true,
    showSettings: false,
    showCustomModule: null,
    draggedModuleType: null,
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

  onAddModule = (year: string, semester: PlannerModuleSemester, module: AddModuleData) => {
    if (module.type === 'module') {
      this.props.addModule(year, semester, {
        type: 'module',
        moduleCode: module.moduleCode,
        yearLong: module.yearLong,
      });
      // TODO: Handle error
      this.props.fetchModule(module.moduleCode);
    } else {
      this.props.addModule(year, semester, module);
    }
  };

  onDragStart: OnDragStartResponder = (evt) => {
    const { draggableId } = evt;
    const { moduleType } = fromDraggableId(draggableId);

    this.setState({ draggedModuleType: moduleType });
  };

  onDropEnd: OnDragEndResponder = (evt) => {
    const { destination, draggableId } = evt;
    const id = draggableId.split('|')[0];

    // No destination = drag and drop cancelled / dropped on invalid target
    if (!destination) return;

    if (destination.droppableId === TRASH_ID) {
      this.props.removeModule(id);
    } else {
      const { acadYear, semester } = fromDroppableId(destination.droppableId);
      this.props.moveModule(id, acadYear, semester, destination.index);
    }
    this.setState({ draggedModuleType: null });
  };

  onAddCustomData = (moduleCode: ModuleCode) =>
    this.setState({
      showCustomModule: moduleCode,
    });

  onSetPlaceholderModule = (id: string, moduleCode: ModuleCode) => {
    this.props.setPlaceholderModule(id, moduleCode);
    this.props.fetchModule(moduleCode);
  };

  closeAddCustomData = () => this.setState({ showCustomModule: null });

  renderHeader() {
    const modules = [...this.props.iblocsModules, ...flatten(flatMap(this.props.modules, values))];
    const credits = getTotalMC(modules);
    const count = modules.length;

    return (
      <header className={styles.header}>
        <h1>
          Course Planner{' '}
          <button
            className="btn btn-sm btn-outline-success"
            type="button"
            onClick={this.props.toggleFeedback}
          >
            Beta - Send Feedback
          </button>
        </h1>

        <div className={styles.headerRight}>
          <p className={styles.moduleStats}>
            {count} {count === 1 ? 'course' : 'courses'} / {renderMCs(credits)}
          </p>

          <button
            className="btn btn-svg btn-outline-primary"
            type="button"
            onClick={() => this.setState({ showSettings: true })}
          >
            <Settings className="svg" /> Settings
          </button>
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

    const commonProps = {
      addModule: this.onAddModule,
      addCustomData: this.onAddCustomData,
      setPlaceholderModule: this.onSetPlaceholderModule,
      removeModule: this.props.removeModule,
      draggedModuleType: this.state.draggedModuleType,
    };

    return (
      <div className={styles.pageContainer}>
        <Title>Course Planner</Title>

        {this.renderHeader()}

        <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDropEnd}>
          <div className={styles.yearWrapper}>
            {iblocs && (
              <section>
                <h2 className={styles.modListHeaders}>iBLOCs</h2>
                <PlannerSemester
                  year={subtractAcadYear(sortedModules[0][0])}
                  semester={IBLOCS_SEMESTER}
                  modules={iblocsModules}
                  {...commonProps}
                />
              </section>
            )}

            {sortedModules.map(([year, semesters], index) => (
              <PlannerYear
                key={year}
                name={`Year ${index + 1}`}
                year={year}
                semesters={semesters}
                {...commonProps}
              />
            ))}
          </div>

          <div className={styles.moduleLists}>
            <section>
              <h2 className={styles.modListHeaders}>Exemptions</h2>
              <PlannerSemester
                year={EXEMPTION_YEAR}
                semester="exemption"
                modules={exemptions}
                showModuleMeta={false}
                {...commonProps}
              />
            </section>

            <section>
              <h2 className={styles.modListHeaders}>Plan to Take</h2>
              <PlannerSemester
                year={PLAN_TO_TAKE_YEAR}
                semester="planToTake"
                modules={planToTake}
                {...commonProps}
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
                    <p>Drop courses here to remove them</p>
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

const PlannerContainer = connect(mapStateToProps, {
  fetchModule,
  toggleFeedback,
  setPlaceholderModule,
  addModule: addPlannerModule,
  moveModule: movePlannerModule,
  removeModule: removePlannerModule,
})(PlannerContainerComponent);

export default PlannerContainer;
