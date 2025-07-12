import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { flatMap, flatten, sortBy, toPairs, values } from 'lodash';
import { DragDropContext, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import classnames from 'classnames';

import { Settings, Trash } from 'react-feather';
import { Module, ModuleCode, Semester } from 'types/modules';
import { PlannerModulesWithInfo, PlannerModuleInfo, AddModuleData } from 'types/planner';
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
import {
  addPlannerModule,
  clearPlanner,
  importPlanner,
  movePlannerModule,
  removePlannerModule,
  setPlaceholderModule,
} from 'actions/planner';
import { toggleFeedback } from 'actions/app';
import { fetchModule } from 'actions/moduleBank';
import { addModule as addModuleToTimetable } from 'actions/timetables';
import { getAcadYearModules, getExemptions, getIBLOCs, getPlanToTake } from 'selectors/planner';
import Title from 'views/components/Title';
import LoadingSpinner from 'views/components/LoadingSpinner';
import Modal from 'views/components/Modal';
import { State as StoreState } from 'types/state';
import { downloadPlanner } from 'actions/export';
import { PlannerState } from 'types/reducers';
import PlannerSemester from '../PlannerSemester';
import PlannerYear from '../PlannerYear';
import PlannerSettings from '../PlannerSettings';
import PlannerClearButton from '../PlannerClearButton';
import PlannerImportButton from '../PlannerImportButton';
import PlannerExportButton from '../PlannerExportButton';
import CustomModuleForm from '../CustomModuleForm';

import styles from './PlannerContainer.scss';

export type Props = Readonly<{
  modules: PlannerModulesWithInfo;
  exemptions: PlannerModuleInfo[];
  planToTake: PlannerModuleInfo[];
  iblocsModules: PlannerModuleInfo[];
  iblocs: boolean;
  includeExemptedModuleCredits?: boolean;

  // Actions
  fetchModule: (moduleCode: ModuleCode) => Promise<Module>;
  toggleFeedback: () => void;

  addModule: (year: string, semester: Semester, module: AddModuleData) => void;
  moveModule: (id: string, year: string, semester: Semester, index: number) => void;
  removeModule: (id: string) => void;
  setPlaceholderModule: (id: string, moduleCode: ModuleCode) => void;
  addModuleToTimetable: (semester: Semester, module: ModuleCode) => void;
  importPlanner: (importedState: PlannerState) => void;
  clearPlanner: () => void;
  downloadPlanner: () => void;
}>;

type SemesterModules = { [semester: string]: PlannerModuleInfo[] };

type State = {
  readonly loading: boolean;
  readonly showSettings: boolean;
  // Module code is the module being edited. null means the modal is not open
  readonly showCustomModule: ModuleCode | null;
};

const TRASH_ID = 'trash';

export class PlannerContainerComponent extends PureComponent<Props, State> {
  override state: State = {
    loading: true,
    showSettings: false,
    showCustomModule: null,
  };

  override componentDidMount() {
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

  onAddModule = (year: string, semester: Semester, module: AddModuleData) => {
    if (module.type === 'module') {
      // Extract everything that looks like a module code
      const moduleCodes = module.moduleCode.toUpperCase().match(MODULE_CODE_REGEX);

      if (moduleCodes) {
        moduleCodes.forEach((moduleCode) => {
          this.props.addModule(year, semester, { type: 'module', moduleCode });
          // TODO: Handle error
          this.props.fetchModule(moduleCode);
        });
      }
    } else {
      this.props.addModule(year, semester, module);
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

  onSetPlaceholderModule = (id: string, moduleCode: ModuleCode) => {
    this.props.setPlaceholderModule(id, moduleCode);
    this.props.fetchModule(moduleCode);
  };

  onAddModuleToTimetable = (semester: Semester, module: ModuleCode) =>
    this.props.fetchModule(module).then(() => this.props.addModuleToTimetable(semester, module));

  closeAddCustomData = () => this.setState({ showCustomModule: null });

  closeSettingsModal = () => this.setState({ showSettings: false });

  renderHeader() {
    const modules = [
      ...this.props.iblocsModules,
      ...flatten(flatMap(this.props.modules, values)),
      ...(this.props.includeExemptedModuleCredits ? this.props.exemptions : []),
    ];
    const credits = getTotalMC(modules);
    const count = modules.length;

    return (
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Course Planner </h1>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.moduleStats}>
            <p>
              {count} {count === 1 ? 'Course' : 'Courses'}&nbsp;/&nbsp;
            </p>
            <p>{renderMCs(credits)}</p>
          </div>

          <div className={classnames(styles.buttonGroup)}>
            <PlannerClearButton clearPlanner={this.props.clearPlanner} />
            <PlannerImportButton importPlanner={this.props.importPlanner} />
            <PlannerExportButton downloadPlanner={this.props.downloadPlanner} />

            <button
              className={classnames('btn btn-svg btn-outline-primary', styles.settingsButton)}
              type="button"
              onClick={() => this.setState({ showSettings: true })}
            >
              <Settings className="svg" />
              <p>Settings</p>
            </button>
          </div>
        </div>
      </header>
    );
  }

  override render() {
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
      addModuleToTimetable: this.onAddModuleToTimetable,
    };

    return (
      <div className={styles.pageContainer}>
        <Title>Course Planner</Title>

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
                semester={EXEMPTION_SEMESTER}
                modules={exemptions}
                showModuleMeta={false}
                {...commonProps}
              />
            </section>

            <section>
              <h2 className={styles.modListHeaders}>Plan to Take</h2>
              <PlannerSemester
                year={PLAN_TO_TAKE_YEAR}
                semester={PLAN_TO_TAKE_SEMESTER}
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

        <Modal isOpen={this.state.showSettings} onRequestClose={this.closeSettingsModal} animate>
          <PlannerSettings onCloseButtonClicked={this.closeSettingsModal} />
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
  includeExemptedModuleCredits: state.planner.includeExemptedModuleCredits,

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
  addModuleToTimetable,
  importPlanner,
  clearPlanner,
  downloadPlanner,
})(PlannerContainerComponent);

export default PlannerContainer;
