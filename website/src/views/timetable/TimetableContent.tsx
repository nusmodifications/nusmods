import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { sortBy, difference, values, flatten, mapValues, isEmpty, uniqWith } from 'lodash';

import { ColorMapping, HORIZONTAL, ModulesMap, TimetableOrientation } from 'types/reducers';
import { ClassNo, LessonType, Module, ModuleCode, Semester } from 'types/modules';
import {
  ColoredLesson,
  Lesson,
  ModifiableLesson,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TaModulesConfig,
  TimetableArrangement,
} from 'types/timetables';

import {
  addModule,
  addTaLessonInTimetable,
  cancelModifyLesson,
  changeLesson,
  modifyLesson,
  removeModule,
  removeTaLessonInTimetable,
  resetTimetable,
} from 'actions/timetables';
import {
  areLessonsSameClass,
  formatExamDate,
  getExamDate,
  getModuleTimetable,
} from 'utils/modules';
import {
  areOtherClassesAvailable,
  arrangeLessonsForWeek,
  findExamClashes,
  getLessonIdentifier,
  getSemesterModules,
  hydrateSemTimetableWithLessons,
  hydrateTaModulesConfigWithLessons,
  lessonsForLessonType,
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
  taImportedModules: TaModulesConfig | null;
};

type Props = OwnProps & {
  // From Redux
  timetableWithLessons: SemTimetableConfigWithLessons;
  modules: ModulesMap;
  activeLesson: Lesson | null;
  timetableOrientation: TimetableOrientation;
  showTitle: boolean;
  hiddenInTimetable: ModuleCode[];
  taInTimetable: TaModulesConfig;

  // Actions
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  removeModule: (semester: Semester, moduleCode: ModuleCode) => void;
  resetTimetable: (semester: Semester) => void;
  modifyLesson: (lesson: Lesson) => void;
  changeLesson: (semester: Semester, lesson: Lesson) => void;
  cancelModifyLesson: () => void;
  addTaLessonInTimetable: (
    semester: Semester,
    moduleCode: ModuleCode,
    lessonType: LessonType,
    classNo: ClassNo,
  ) => void;
  removeTaLessonInTimetable: (
    semester: Semester,
    moduleCode: ModuleCode,
    lessonType: LessonType,
    classNo: ClassNo,
  ) => void;
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

  cancelModifyLesson = () => {
    if (this.props.activeLesson) {
      this.props.cancelModifyLesson();

      resetScrollPosition();
    }
  };

  isHiddenInTimetable = (moduleCode: ModuleCode) =>
    this.props.hiddenInTimetable.includes(moduleCode);

  isTaInTimetable = (moduleCode: ModuleCode) => this.props.taInTimetable[moduleCode]?.length > 0;

  // Adds all current lessons as TA lessons
  setTaLessonInTimetable = (semester: Semester, moduleCode: ModuleCode) => {
    const moduleLessons = timetableLessonsArray(this.props.timetableWithLessons).filter(
      (lesson) => lesson.moduleCode === moduleCode,
    );
    // Deduplicate because some modules add multiple lessons under the same class number (e.g. CS2103T)
    uniqWith(moduleLessons, areLessonsSameClass).forEach((lesson) =>
      this.props.addTaLessonInTimetable(semester, moduleCode, lesson.lessonType, lesson.classNo),
    );
  };

  modifyTaCell(lesson: ModifiableLesson) {
    const { moduleCode, lessonType, classNo } = lesson;
    if (lesson.isOptionInTimetable) {
      // Allow multiple lessons of the same type to be added for TA lessons
      this.props.addTaLessonInTimetable(this.props.semester, moduleCode, lessonType, classNo);
    } else if (this.props.taInTimetable[moduleCode].length > 1) {
      // If a TA lesson is the last of its type, disallow removing it
      this.props.removeTaLessonInTimetable(this.props.semester, moduleCode, lessonType, classNo);
    } else {
      this.props.cancelModifyLesson();
    }
    resetScrollPosition();
  }

  modifyCell = (lesson: ModifiableLesson, position: ClientRect) => {
    const { activeLesson } = this.props;
    // If activeLesson exists, then the user is choosing a cell to modify
    const isChoosing = !!activeLesson;
    if (isChoosing) {
      if (this.isTaInTimetable(lesson.moduleCode)) {
        this.modifyTaCell(lesson);
        return;
      }

      if (lesson.isAvailable) {
        this.props.changeLesson(this.props.semester, lesson);
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
      enableTaModeInTimetable={this.setTaLessonInTimetable}
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

    let timetableLessons: Lesson[] = timetableLessonsArray(this.props.timetableWithLessons)
      // Omit all lessons for hidden modules
      .filter((lesson) => !this.isHiddenInTimetable(lesson.moduleCode));

    if (activeLesson) {
      const { moduleCode } = activeLesson;
      // Remove activeLesson because it will appear again
      timetableLessons = timetableLessons.filter(
        (lesson) => !areLessonsSameClass(lesson, activeLesson),
      );

      const module = modules[moduleCode];
      const moduleTimetable = getModuleTimetable(module, semester);
      const lessonOptions = this.isTaInTimetable(moduleCode)
        ? moduleTimetable
        : lessonsForLessonType(moduleTimetable, activeLesson.lessonType);
      lessonOptions.forEach((lesson) => {
        const modifiableLesson: Omit<ModifiableLesson, 'isModifiable' | 'colorIndex'> = {
          ...lesson,
          // Inject module code in
          moduleCode,
          title: module.title,
        };

        // All lessons added within this block are options to be added in the timetable
        // Except for the activeLesson
        modifiableLesson.isOptionInTimetable = true;
        if (areLessonsSameClass(modifiableLesson, activeLesson)) {
          modifiableLesson.isActive = true;
          modifiableLesson.isOptionInTimetable = false;
        } else if (
          this.isTaInTimetable(moduleCode) ||
          lesson.lessonType === activeLesson.lessonType
        ) {
          modifiableLesson.isAvailable = true;
        }
        timetableLessons.push(modifiableLesson);
      });
    }

    // Inject color into module
    const coloredTimetableLessons = timetableLessons.map(
      (lesson: Lesson): ColoredLesson => ({
        ...lesson,
        colorIndex: colors[lesson.moduleCode],
        isTaInTimetable: this.isTaInTimetable(lesson.moduleCode),
      }),
    );

    const arrangedLessons = arrangeLessonsForWeek(coloredTimetableLessons);
    const arrangedLessonsWithModifiableFlag: TimetableArrangement = mapValues(
      arrangedLessons,
      (dayRows) =>
        dayRows.map((row) =>
          row.map((lesson) => {
            const module: Module = modules[lesson.moduleCode];
            const moduleTimetable = getModuleTimetable(module, semester);

            return {
              ...lesson,
              isModifiable:
                !readOnly && areOtherClassesAvailable(moduleTimetable, lesson.lessonType),
            };
          }),
        ),
    );

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
                  lessons={arrangedLessonsWithModifiableFlag}
                  isVerticalOrientation={isVerticalOrientation}
                  isScrolledHorizontally={this.state.isScrolledHorizontally}
                  showTitle={isShowingTitle}
                  onModifyCell={this.modifyCell}
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
  const taInTimetable = ownProps.taImportedModules ?? state.timetables.ta[semester] ?? {};

  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);
  const timetableWithTaLessons = hydrateTaModulesConfigWithLessons(
    taInTimetable,
    modules,
    semester,
  );
  const filteredTimetableWithLessons = {
    ...timetableWithLessons,
    ...timetableWithTaLessons,
  };

  return {
    semester,
    timetable,
    timetableWithLessons: filteredTimetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    timetableOrientation: state.theme.timetableOrientation,
    showTitle: state.theme.showTitle,
    hiddenInTimetable,
    taInTimetable,
  };
}

export default connect(mapStateToProps, {
  addModule,
  removeModule,
  resetTimetable,
  modifyLesson,
  changeLesson,
  cancelModifyLesson,
  addTaLessonInTimetable,
  removeTaLessonInTimetable,
})(TimetableContent);
