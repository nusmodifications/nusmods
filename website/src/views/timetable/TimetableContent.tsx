import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import {
  sortBy,
  difference,
  values,
  flatten,
  mapValues,
  isEmpty,
  groupBy,
  map,
  filter,
  isArray,
  keys,
} from 'lodash';

import { ColorMapping, HORIZONTAL, ModulesMap, TimetableOrientation } from 'types/reducers';
import { LessonIndex, LessonType, Module, ModuleCode, Semester } from 'types/modules';
import {
  SemTimetableConfig,
  TaModulesConfig,
  SemTimetableConfigWithLessons,
  InteractableLesson,
  LessonWithIndex,
  ClassNoTaModulesConfig,
} from 'types/timetables';

import {
  addModule,
  cancelModifyLesson,
  changeLesson,
  addLesson,
  removeLesson,
  modifyLesson,
  removeModule,
  resetTimetable,
} from 'actions/timetables';
import { formatExamDate, getExamDate, getModuleTimetable } from 'utils/modules';
import {
  areOtherClassesAvailable,
  arrangeLessonsForWeek,
  findExamClashes,
  getLessonIdentifier,
  getSemesterModules,
  hydrateSemTimetableWithLessons,
  timetableLessonsArray,
} from 'utils/timetables';
import { resetScrollPosition } from 'utils/react';
import ModulesSelectContainer from 'views/timetable/ModulesSelectContainer';
import Announcements from 'views/components/notfications/Announcements';
import Title from 'views/components/Title';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ModRegNotification from 'views/components/notfications/ModRegNotification';
import { State as StoreState } from 'types/state';
import { ModuleWithColor, TombstoneModule } from 'types/views';
import Timetable from './Timetable';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';
import ExamCalendar from './ExamCalendar';
import ModulesTableFooter from './ModulesTableFooter';
import styles from './TimetableContent.scss';

type ModifiedCell = {
  className: string;
  position: ClientRect;
};

type OwnProps = {
  // Own props
  readOnly: boolean;
  header: React.ReactNode;
  semester: Semester;
  timetable: SemTimetableConfig;
  colors: ColorMapping;
  hiddenImportedModules: ModuleCode[] | null;
  taImportedModules: TaModulesConfig | ClassNoTaModulesConfig | null;
};

type Props = OwnProps & {
  // From Redux
  timetableWithLessons: SemTimetableConfigWithLessons;
  modules: ModulesMap;
  activeLesson: LessonWithIndex | null;
  timetableOrientation: TimetableOrientation;
  showTitle: boolean;
  hiddenInTimetable: ModuleCode[];
  taInTimetable: TaModulesConfig;

  // Actions
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  removeModule: (semester: Semester, moduleCode: ModuleCode) => void;
  resetTimetable: (semester: Semester) => void;
  modifyLesson: (lesson: LessonWithIndex) => void;
  addLesson: (
    semester: Semester,
    moduleCode: ModuleCode,
    lessonType: LessonType,
    lessonIndices: LessonIndex[],
  ) => void;
  removeLesson: (
    semester: Semester,
    moduleCode: ModuleCode,
    lessonType: LessonType,
    lessonIndices: LessonIndex[],
  ) => void;
  changeLesson: (
    semester: Semester,
    moduleCode: ModuleCode,
    lessonType: LessonType,
    lessonIndices: LessonIndex[],
  ) => void;
  cancelModifyLesson: () => void;
};

type State = {
  isScrolledHorizontally: boolean;
  showExamCalendar: boolean;
  tombstone: TombstoneModule | null;
};

/**
 * When a module is modified, we want to ensure the selected timetable cell
 * is in approximately the same location when all of the new options are rendered.
 * This is important for modules with a lot of options which can push the selected
 * option off screen and disorientate the user.
 */
function maintainScrollPosition(container: HTMLElement, modifiedCell: ModifiedCell) {
  const newCell = container.getElementsByClassName(modifiedCell.className)[0];
  if (!newCell) return;

  const previousPosition = modifiedCell.position;
  const currentPosition = newCell.getBoundingClientRect();

  // We try to ensure the cell is in the same position on screen, so we calculate
  // the new position by taking the difference between the two positions and
  // adding it to the scroll position of the scroll container, which is the
  // window for the y axis and the timetable container for the x axis
  const x = currentPosition.left - previousPosition.left + window.scrollX;
  const y = currentPosition.top - previousPosition.top + window.scrollY;

  window.scroll(0, y);
  container.scrollLeft = x; // eslint-disable-line no-param-reassign
}

class TimetableContent extends React.Component<Props, State> {
  override state: State = {
    isScrolledHorizontally: false,
    showExamCalendar: false,
    tombstone: null,
  };

  timetableRef = React.createRef<HTMLDivElement>();

  modifiedCell: ModifiedCell | null = null;

  override componentDidUpdate() {
    if (this.modifiedCell && this.timetableRef.current) {
      maintainScrollPosition(this.timetableRef.current, this.modifiedCell);

      this.modifiedCell = null;
    }
  }

  override componentWillUnmount() {
    this.cancelModifyLesson();
  }

  onScroll: React.UIEventHandler = (e) => {
    // Only trigger when there is an active lesson
    const isScrolledHorizontally =
      !!this.props.activeLesson && e.currentTarget && e.currentTarget.scrollLeft > 0;
    if (this.state.isScrolledHorizontally !== isScrolledHorizontally) {
      this.setState({ isScrolledHorizontally });
    }
  };

  modifyTaCell = (
    sameLessonTypeLessons: InteractableLesson[],
    lesson: InteractableLesson,
  ): void => {
    const { moduleCode, lessonType, lessonIndex } = lesson;

    const currentlySelected = sameLessonTypeLessons.filter(
      (sameLessonTypeLesson) => !sameLessonTypeLesson.canBeAddedToLessonConfig,
    );
    if (lesson.canBeAddedToLessonConfig) {
      // Allow multiple lessons of the same type to be added for TA lessons
      this.props.addLesson(this.props.semester, moduleCode, lessonType, [lessonIndex]);
    } else if (currentlySelected.length > 1) {
      // If a TA lesson is the last of its type, disallow removing it
      this.props.removeLesson(this.props.semester, moduleCode, lessonType, [lessonIndex]);
    } else {
      this.props.cancelModifyLesson();
    }
    resetScrollPosition();
  };

  modifyCell =
    (moduleTimetable: InteractableLesson[], activeLesson: LessonWithIndex | null) =>
    (lesson: InteractableLesson, position: ClientRect): void => {
      // If activeLesson exists, then the user is choosing a cell to modify
      const isChoosing = !!activeLesson;
      if (isChoosing) {
        const sameLessonTypeLessons = moduleTimetable.filter(
          (timetableLesson) =>
            timetableLesson.moduleCode === lesson.moduleCode &&
            timetableLesson.lessonType === lesson.lessonType,
        );

        if (this.isTaInTimetable(lesson.moduleCode)) {
          this.modifyTaCell(sameLessonTypeLessons, lesson);
          return;
        }

        if (lesson.canBeAddedToLessonConfig) {
          const lessonIndices = map(
            filter(
              sameLessonTypeLessons,
              (timetableLessons) => timetableLessons.classNo === lesson.classNo,
            ),
            (sameLessonTypeLesson) => sameLessonTypeLesson.lessonIndex,
          );
          this.props.changeLesson(
            this.props.semester,
            lesson.moduleCode,
            lesson.lessonType,
            lessonIndices,
          );
        } else {
          this.props.cancelModifyLesson();
        }
        resetScrollPosition();
      } else {
        this.props.modifyLesson(lesson);

        this.modifiedCell = {
          position,
          className: getLessonIdentifier(lesson),
        };
      }
    };

  cancelModifyLesson = (): void => {
    if (this.props.activeLesson) {
      this.props.cancelModifyLesson();

      resetScrollPosition();
    }
  };

  isHiddenInTimetable = (moduleCode: ModuleCode): boolean =>
    this.props.hiddenInTimetable.includes(moduleCode);

  isTaInTimetable = (moduleCode: ModuleCode): boolean =>
    this.props.taInTimetable.includes(moduleCode);

  addModule = (semester: Semester, moduleCode: ModuleCode) => {
    this.props.addModule(semester, moduleCode);
    this.resetTombstone();
  };

  removeModule = (moduleCodeToRemove: ModuleCode) => {
    // Save the index of the module before removal so the tombstone can be inserted into
    // the correct position
    const index = this.addedModules().findIndex(
      ({ moduleCode }) => moduleCode === moduleCodeToRemove,
    );
    this.props.removeModule(this.props.semester, moduleCodeToRemove);
    const moduleWithColor = this.toModuleWithColor(this.addedModules()[index]);

    // A tombstone is displayed in place of a deleted module
    this.setState({ tombstone: { ...moduleWithColor, index } });
  };

  resetTimetable = () => {
    this.props.resetTimetable(this.props.semester);
  };

  resetTombstone = () => this.setState({ tombstone: null });

  // Returns modules currently in the timetable
  addedModules(): Module[] {
    const modules = getSemesterModules(this.props.timetableWithLessons, this.props.modules);
    return sortBy(modules, (module: Module) => getExamDate(module, this.props.semester));
  }

  toModuleWithColor = (module: Module): ModuleWithColor => ({
    ...module,
    colorIndex: this.props.colors[module.moduleCode],
    isHiddenInTimetable: this.isHiddenInTimetable(module.moduleCode),
    isTaInTimetable: this.isTaInTimetable(module.moduleCode),
  });

  renderModuleTable = (
    modules: Module[],
    horizontalOrientation: boolean,
    tombstone: TombstoneModule | null = null,
  ) => (
    <TimetableModulesTable
      modules={modules.map(this.toModuleWithColor)}
      horizontalOrientation={horizontalOrientation}
      semester={this.props.semester}
      onRemoveModule={this.removeModule}
      readOnly={this.props.readOnly}
      tombstone={tombstone}
      resetTombstone={this.resetTombstone}
    />
  );

  // Returns component with table(s) of modules
  renderModuleSections(modules: Module[], horizontalOrientation: boolean) {
    const { tombstone } = this.state;

    // Separate added modules into sections of clashing modules.
    // Note: exclude hidden courses and TA-ed courses from exam clash detection.
    const examinableModules = modules.filter(
      (module) =>
        !this.isHiddenInTimetable(module.moduleCode) && !this.isTaInTimetable(module.moduleCode),
    );
    const clashes = findExamClashes(examinableModules, this.props.semester);
    const nonClashingMods: Module[] = difference(modules, flatten(values(clashes)));

    if (isEmpty(clashes) && isEmpty(nonClashingMods) && !tombstone) {
      return (
        <div className="row">
          <div className="col-sm-12">
            <p className="text-sm-center">No courses added.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {!isEmpty(clashes) && (
          <>
            <div className="alert alert-danger">
              Warning! There are clashes in your exam timetable.
            </div>
            {Object.keys(clashes)
              .sort()
              .map((clashDate) => (
                <div key={clashDate}>
                  <p>
                    Clash on <strong>{formatExamDate(clashDate)}</strong>
                  </p>
                  {this.renderModuleTable(clashes[clashDate], horizontalOrientation)}
                </div>
              ))}
            <hr />
          </>
        )}
        {this.renderModuleTable(nonClashingMods, horizontalOrientation, tombstone)}
      </>
    );
  }

  /**
   * Hydrates a list of lessons to add interactability info\
   * See type defintion of `InteractableLesson` for properties added
   */
  hydrateInteractability(
    timetableLessons: LessonWithIndex[],
    modules: ModulesMap,
    semester: Semester,
    colors: ColorMapping,
    readOnly: boolean,
    activeLesson?: LessonWithIndex,
    alreadySelectedLessonIndices?: LessonIndex[],
  ): InteractableLesson[] {
    const moduleTimetables = mapValues(modules, (module) => getModuleTimetable(module, semester));

    return map(timetableLessons, (lesson) => {
      const { moduleCode, lessonType, classNo, lessonIndex } = lesson;
      const isSameModuleAndLessonType =
        moduleCode === activeLesson?.moduleCode && lessonType === activeLesson?.lessonType;

      const isActive = isSameModuleAndLessonType && lessonIndex === activeLesson?.lessonIndex;
      const isTaInTimetable = this.isTaInTimetable(moduleCode);
      const canBeSelectedAsActiveLesson =
        !readOnly && areOtherClassesAvailable(moduleTimetables[moduleCode], lessonType);

      const alreadyAddedToLessonConfig = alreadySelectedLessonIndices?.includes(lesson.lessonIndex);
      const isSameLessonGroupAsActiveLesson = isTaInTimetable
        ? lessonIndex === activeLesson?.lessonIndex
        : classNo === activeLesson?.classNo;
      const canBeAddedToLessonConfig =
        isSameModuleAndLessonType &&
        !alreadyAddedToLessonConfig &&
        !isSameLessonGroupAsActiveLesson;

      return {
        ...lesson,
        isActive,
        isTaInTimetable,
        canBeAddedToLessonConfig,
        canBeSelectedAsActiveLesson,
        colorIndex: colors[moduleCode],
      };
    });
  }

  /**
   * Hydrate timetable lessons with interactability info\
   * See type defintion of `InteractableLesson` for properties added
   */
  getInteractableLessons(
    timetableLessons: LessonWithIndex[],
    modules: ModulesMap,
    semester: Semester,
    colors: ColorMapping,
    readOnly: boolean,
    activeLesson: LessonWithIndex | null,
  ): InteractableLesson[] {
    if (!activeLesson)
      return this.hydrateInteractability(timetableLessons, modules, semester, colors, readOnly);
    const activeModule = modules[activeLesson.moduleCode];
    const activeLessonTypeLessons = map(
      filter(
        getModuleTimetable(activeModule, semester),
        (lesson) => lesson.lessonType === activeLesson.lessonType,
      ),
      (lesson) => ({ ...lesson, moduleCode: activeModule.moduleCode, title: activeModule.title }),
    );

    const { alreadySelected, otherLessons } = groupBy(timetableLessons, (lesson) =>
      lesson.moduleCode === activeLesson.moduleCode && lesson.lessonType === activeLesson.lessonType
        ? 'alreadySelected'
        : 'otherLessons',
    );
    const alreadySelectedLessonIndices = map(alreadySelected, 'lessonIndex');

    return [
      ...this.hydrateInteractability(
        activeLessonTypeLessons,
        modules,
        semester,
        colors,
        readOnly,
        activeLesson,
        alreadySelectedLessonIndices,
      ),
      ...this.hydrateInteractability(otherLessons, modules, semester, colors, readOnly),
    ];
  }

  override render() {
    const {
      semester,
      modules,
      colors,
      activeLesson,
      timetableOrientation,
      showTitle,
      readOnly,
      hiddenInTimetable,
      taInTimetable,
    } = this.props;

    const { showExamCalendar } = this.state;

    const timetableLessons: LessonWithIndex[] = timetableLessonsArray(
      this.props.timetableWithLessons,
    ).filter((lesson) => !this.isHiddenInTimetable(lesson.moduleCode));

    const coloredTimetableLessons: InteractableLesson[] = this.getInteractableLessons(
      timetableLessons,
      modules,
      semester,
      colors,
      readOnly,
      activeLesson,
    );
    const arrangedLessons = arrangeLessonsForWeek(coloredTimetableLessons);

    const isVerticalOrientation = timetableOrientation !== HORIZONTAL;
    const isShowingTitle = !isVerticalOrientation && showTitle;
    const addedModules = this.addedModules();

    return (
      <div
        className={classnames('page-container', styles.container, {
          verticalMode: isVerticalOrientation,
        })}
        onClick={this.cancelModifyLesson}
        onKeyUp={(e) => e.key === 'Escape' && this.cancelModifyLesson()} // Quit modifying when Esc is pressed
      >
        <Title>Timetable</Title>

        <Announcements />

        <ErrorBoundary>
          <ModRegNotification />
        </ErrorBoundary>

        <div>{this.props.header}</div>

        <div className="row">
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-8': isVerticalOrientation,
            })}
          >
            {showExamCalendar ? (
              <ExamCalendar
                semester={semester}
                modules={addedModules.map((module) => ({
                  ...module,
                  colorIndex: this.props.colors[module.moduleCode],
                  isHiddenInTimetable: this.isHiddenInTimetable(module.moduleCode),
                  isTaInTimetable: this.isTaInTimetable(module.moduleCode),
                }))}
              />
            ) : (
              <div
                className={styles.timetableWrapper}
                onScroll={this.onScroll}
                ref={this.timetableRef}
              >
                <Timetable
                  lessons={arrangedLessons}
                  isVerticalOrientation={isVerticalOrientation}
                  isScrolledHorizontally={this.state.isScrolledHorizontally}
                  showTitle={isShowingTitle}
                  onModifyCell={this.modifyCell(coloredTimetableLessons, activeLesson)}
                />
              </div>
            )}
          </div>
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-4': isVerticalOrientation,
            })}
          >
            <div className="row">
              <div className="col-12 no-export">
                <TimetableActions
                  isVerticalOrientation={isVerticalOrientation}
                  showTitle={isShowingTitle}
                  semester={semester}
                  timetable={this.props.timetable}
                  showExamCalendar={showExamCalendar}
                  resetTimetable={this.resetTimetable}
                  toggleExamCalendar={() => this.setState({ showExamCalendar: !showExamCalendar })}
                  hiddenModules={hiddenInTimetable}
                  taModules={taInTimetable}
                />
              </div>

              <div className={styles.modulesSelect}>
                {!readOnly && (
                  <ModulesSelectContainer
                    semester={semester}
                    timetable={this.props.timetable}
                    addModule={this.addModule}
                    removeModule={this.removeModule}
                  />
                )}
              </div>

              <div className="col-12">
                {this.renderModuleSections(addedModules, !isVerticalOrientation)}
              </div>
              <div className="col-12">
                <ModulesTableFooter
                  modules={addedModules}
                  semester={semester}
                  hiddenInTimetable={hiddenInTimetable}
                  taInTimetable={taInTimetable}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StoreState, ownProps: OwnProps) {
  const { semester, timetable } = ownProps;
  const { modules } = state.moduleBank;

  const hiddenInTimetable =
    ownProps.hiddenImportedModules ?? state.timetables.hidden[semester] ?? [];
  const taInTimetable = ownProps.taImportedModules ?? state.timetables.ta[semester] ?? [];
  const taModuleCodes: TaModulesConfig = isArray(taInTimetable)
    ? taInTimetable
    : keys(taInTimetable);

  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);

  return {
    semester,
    timetable,
    timetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    timetableOrientation: state.theme.timetableOrientation,
    showTitle: state.theme.showTitle,
    hiddenInTimetable,
    taInTimetable: taModuleCodes,
  };
}

export default connect(mapStateToProps, {
  addModule,
  removeModule,
  resetTimetable,
  modifyLesson,
  changeLesson,
  addLesson,
  removeLesson,
  cancelModifyLesson,
})(TimetableContent);
