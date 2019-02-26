import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import _, { isEmpty } from 'lodash';

import { ModulesMap } from 'reducers/moduleBank';
import { ColorMapping, HORIZONTAL, TimetableOrientation } from 'types/reducers';
import {
  ColoredLesson,
  Lesson,
  ModifiableLesson,
  Module,
  ModuleCode,
  ModuleWithColor,
  Semester,
} from 'types/modules';
import {
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
} from 'actions/timetables';
import { undo } from 'actions/undoHistory';
import {
  areLessonsSameClass,
  formatExamDate,
  getModuleExamDate,
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
import { State as StoreState } from 'reducers';
import config from 'config';
import ModulesSelectContainer from 'views/timetable/ModulesSelectContainer';
import Announcements from 'views/components/notfications/Announcements';
import Title from 'views/components/Title';
import NoLessonWarning from 'views/timetable/NoLessonWarning';
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
};

type State = {
  isScrolledHorizontally: boolean;
  showExamCalendar: boolean;
  tombstone: ModuleWithColor | null;
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
    if (lesson.isAvailable) {
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

  removeModule = (module: ModuleWithColor) => {
    this.props.removeModule(this.props.semester, module.ModuleCode);

    // A tombstone is displayed in place of a deleted module
    this.setState({ tombstone: module });
  };

  resetTombstone = () => this.setState({ tombstone: null });

  // Returns modules currently in the timetable
  addedModules(): Module[] {
    const modules = getSemesterModules(this.props.timetableWithLessons, this.props.modules);
    return _.sortBy(modules, (module: Module) => getModuleExamDate(module, this.props.semester));
  }

  renderModuleTable = (
    modules: Module[],
    horizontalOrientation: boolean,
    tombstone: ModuleWithColor | null = null,
  ) => (
    <TimetableModulesTable
      modules={modules.map((module) => ({
        ...module,
        colorIndex: this.props.colors[module.ModuleCode],
        hiddenInTimetable: this.isHiddenInTimetable(module.ModuleCode),
      }))}
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
      .filter((lesson) => !this.isHiddenInTimetable(lesson.ModuleCode));

    if (activeLesson) {
      const moduleCode = activeLesson.ModuleCode;
      // Remove activeLesson because it will appear again
      timetableLessons = timetableLessons.filter(
        (lesson) => !areLessonsSameClass(lesson, activeLesson),
      );

      const module = modules[moduleCode];
      const moduleTimetable = getModuleTimetable(module, semester);
      lessonsForLessonType(moduleTimetable, activeLesson.LessonType).forEach((lesson) => {
        const modifiableLesson: Lesson & { isActive?: boolean; isAvailable?: boolean } = {
          ...lesson,
          // Inject module code in
          ModuleCode: moduleCode,
          ModuleTitle: module.ModuleTitle,
        };

        if (areLessonsSameClass(modifiableLesson, activeLesson)) {
          modifiableLesson.isActive = true;
        } else if (lesson.LessonType === activeLesson.LessonType) {
          modifiableLesson.isAvailable = true;
        }
        timetableLessons.push(modifiableLesson);
      });
    }

    // Inject color into module
    const coloredTimetableLessons = timetableLessons.map(
      (lesson: Lesson): ColoredLesson => ({
        ...lesson,
        colorIndex: colors[lesson.ModuleCode],
      }),
    );

    const arrangedLessons = arrangeLessonsForWeek(coloredTimetableLessons);
    const arrangedLessonsWithModifiableFlag: TimetableArrangement = _.mapValues(
      arrangedLessons,
      (dayRows) =>
        dayRows.map((row) =>
          row.map((lesson) => {
            const module: Module = modules[lesson.ModuleCode];
            const moduleTimetable = getModuleTimetable(module, semester);

            return {
              ...lesson,
              isModifiable:
                !readOnly && areOtherClassesAvailable(moduleTimetable, lesson.LessonType),
            };
          }),
        ),
    );

    const isVerticalOrientation = timetableOrientation !== HORIZONTAL;
    const isShowingTitle = !isVerticalOrientation && showTitle;
    const showNoLessonWarning =
      !config.timetableAvailable.includes(semester) && isEmpty(arrangedLessonsWithModifiableFlag);
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
                  colorIndex: this.props.colors[module.ModuleCode],
                  hiddenInTimetable: this.isHiddenInTimetable(module.ModuleCode),
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
                {showNoLessonWarning && <NoLessonWarning />}
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
                  />
                )}
              </div>

              <div className="col-12">
                {this.renderModuleSections(addedModules, !isVerticalOrientation)}
              </div>
              <div className="col-12">
                <ModulesTableFooter modules={addedModules} />
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
  const modules = state.moduleBank.modules;
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);
  const hiddenInTimetable = state.timetables.hidden[semester] || [];

  return {
    semester,
    timetable,
    timetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    timetableOrientation: state.theme.timetableOrientation,
    showTitle: state.theme.showTitle,
    hiddenInTimetable,
  };
}

export default connect(
  mapStateToProps,
  {
    addModule,
    removeModule,
    modifyLesson,
    changeLesson,
    cancelModifyLesson,
    undo,
  },
)(TimetableContent);
