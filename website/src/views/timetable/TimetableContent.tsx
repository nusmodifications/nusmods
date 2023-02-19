import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import _ from 'lodash';

import { ColorMapping, HORIZONTAL, ModulesMap, TimetableOrientation } from 'types/reducers';
import { ClassNo, LessonType, Module, ModuleCode, Semester } from 'types/modules';
import {
  ColoredLesson,
  Lesson,
  ModifiableLesson,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
} from 'types/timetables';

import {
  addModule,
  cancelModifyLesson,
  changeLesson,
  modifyLesson,
  removeModule,
  addLesson,
  removeLesson,
} from 'actions/timetables';
import { undo } from 'actions/undoHistory';
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
import { TombstoneModule } from 'types/views';
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
};

type Props = OwnProps & {
  // From Redux
  timetableWithLessons: SemTimetableConfigWithLessons;
  modules: ModulesMap;
  activeLesson: Lesson | null;
  customiseModule: ModuleCode | null;
  timetableOrientation: TimetableOrientation;
  showTitle: boolean;
  hiddenInTimetable: ModuleCode[];

  // Actions
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  removeModule: (semester: Semester, moduleCode: ModuleCode) => void;
  modifyLesson: (lesson: Lesson) => void;
  changeLesson: (semester: Semester, lesson: Lesson) => void;
  cancelModifyLesson: () => void;
  undo: () => void;
  addLesson: (semester: Semester, moduleCode: ModuleCode, lessonType: LessonType, classNo: ClassNo) => void;
  removeLesson: (semester: Semester, moduleCode: ModuleCode, lessonType: LessonType, classNo: ClassNo) => void;
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
  state: State = {
    isScrolledHorizontally: false,
    showExamCalendar: false,
    tombstone: null,
  };

  timetableRef = React.createRef<HTMLDivElement>();

  modifiedCell: ModifiedCell | null = null;

  componentDidUpdate() {
    if (this.modifiedCell && this.timetableRef.current) {
      maintainScrollPosition(this.timetableRef.current, this.modifiedCell);

      this.modifiedCell = null;
    }
  }

  componentWillUnmount() {
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

  modifyCell = (lesson: ModifiableLesson, position: ClientRect) => {
    if (this.props.customiseModule === lesson.moduleCode) {
      this.modifiedCell = {
        position,
        className: getLessonIdentifier(lesson),
      };
      console.log(lesson);
      if (lesson.isAvailable) {
        this.props.addLesson(this.props.semester, lesson.moduleCode, lesson.lessonType, lesson.classNo);
      } else if (lesson.isActive) {
        this.props.removeLesson(this.props.semester, lesson.moduleCode, lesson.lessonType, lesson.classNo);
      }
    } else if (lesson.isAvailable) {
      this.props.changeLesson(this.props.semester, lesson);

      resetScrollPosition();
    } else if (lesson.isActive) {
      this.props.cancelModifyLesson();

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

  resetTombstone = () => this.setState({ tombstone: null });

  // Returns modules currently in the timetable
  addedModules(): Module[] {
    const modules = getSemesterModules(this.props.timetableWithLessons, this.props.modules);
    return _.sortBy(modules, (module: Module) => getExamDate(module, this.props.semester));
  }

  toModuleWithColor = (module: Module) => ({
    ...module,
    colorIndex: this.props.colors[module.moduleCode],
    hiddenInTimetable: this.isHiddenInTimetable(module.moduleCode),
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

    // Separate added modules into sections of clashing modules
    const clashes = findExamClashes(modules, this.props.semester);
    const nonClashingMods: Module[] = _.difference(modules, _.flatten(_.values(clashes)));

    if (_.isEmpty(clashes) && _.isEmpty(nonClashingMods) && !tombstone) {
      return (
        <div className="row">
          <div className="col-sm-12">
            <p className="text-sm-center">No modules added.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {!_.isEmpty(clashes) && (
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

  render() {
    const {
      semester,
      modules,
      colors,
      activeLesson,
      timetableOrientation,
      showTitle,
      readOnly,
    } = this.props;

    const { showExamCalendar } = this.state;

    let timetableLessons: Lesson[] = timetableLessonsArray(this.props.timetableWithLessons)
      // Do not process hidden modules
      .filter((lesson) => !this.isHiddenInTimetable(lesson.moduleCode));

    if (this.props.customiseModule) {
      const activeLessons = timetableLessons.filter((lesson) => lesson.moduleCode === this.props.customiseModule,);
      timetableLessons = timetableLessons.filter(
        (lesson) => lesson.moduleCode !== this.props.customiseModule,
      );

      const module = modules[this.props.customiseModule];
      let moduleTimetable = getModuleTimetable(module, semester);
      moduleTimetable.forEach((lesson) => {
        const isActiveLesson = activeLessons.filter((timetableLesson) => 
        timetableLesson.classNo == lesson.classNo && timetableLesson.lessonType == lesson.lessonType
        ).length > 0
        const modifiableLesson: Lesson & { isActive?: boolean; isAvailable?: boolean } = {
          ...lesson,
          // Inject module code in
          moduleCode: this.props.customiseModule!,
          title: module.title,
          isAvailable: !isActiveLesson,
          isActive: isActiveLesson,
        };
        timetableLessons.push(modifiableLesson);
      });
    } else if (activeLesson) {
      const { moduleCode } = activeLesson;
      // Remove activeLesson because it will appear again
      timetableLessons = timetableLessons.filter(
        (lesson) => !areLessonsSameClass(lesson, activeLesson),
      );

      const module = modules[moduleCode];
      const moduleTimetable = getModuleTimetable(module, semester);
      lessonsForLessonType(moduleTimetable, activeLesson.lessonType).forEach((lesson) => {
        const modifiableLesson: Lesson & { isActive?: boolean; isAvailable?: boolean } = {
          ...lesson,
          // Inject module code in
          moduleCode,
          title: module.title,
        };

        if (areLessonsSameClass(modifiableLesson, activeLesson)) {
          modifiableLesson.isActive = true;
        } else if (lesson.lessonType === activeLesson.lessonType) {
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
      }),
    );

    const arrangedLessons = arrangeLessonsForWeek(coloredTimetableLessons);
    const arrangedLessonsWithModifiableFlag: TimetableArrangement = _.mapValues(
      arrangedLessons,
      (dayRows) =>
        dayRows.map((row) =>
          row.map((lesson) => {
            const module: Module = modules[lesson.moduleCode];
            const moduleTimetable = getModuleTimetable(module, semester);

            return {
              ...lesson,
              isModifiable:
                this.props.customiseModule
                ? true
                : !readOnly && areOtherClassesAvailable(moduleTimetable, lesson.lessonType),
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
        onKeyUp={(e) => e.keyCode === 27 && this.cancelModifyLesson()} // Quit modifying when Esc is pressed
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
                  hiddenInTimetable: this.isHiddenInTimetable(module.moduleCode),
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
                  toggleExamCalendar={() => this.setState({ showExamCalendar: !showExamCalendar })}
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
                <ModulesTableFooter modules={addedModules} semester={semester} />
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
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);
  const hiddenInTimetable = state.timetables.hidden[semester] || [];

  return {
    semester,
    timetable,
    timetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    customiseModule: state.app.customiseModule,
    timetableOrientation: state.theme.timetableOrientation,
    showTitle: state.theme.showTitle,
    hiddenInTimetable,
  };
}

export default connect(mapStateToProps, {
  addModule,
  removeModule,
  modifyLesson,
  changeLesson,
  cancelModifyLesson,
  undo,
  addLesson,
  removeLesson,
})(TimetableContent);
