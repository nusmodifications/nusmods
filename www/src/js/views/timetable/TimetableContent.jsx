// @flow
import React, { Component, Fragment, type Node } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import _ from 'lodash';

import type { ModulesMap } from 'reducers/moduleBank';
import type { ColorMapping, TimetableOrientation, NotificationOptions } from 'types/reducers';
import { HORIZONTAL } from 'types/reducers';
import type { Lesson, ColoredLesson, Module, ModuleCode, Semester } from 'types/modules';
import type {
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
} from 'types/timetables';

import { cancelModifyLesson, changeLesson, modifyLesson, removeModule } from 'actions/timetables';
import { openNotification } from 'actions/app';
import { undo } from 'actions/undoHistory';
import {
  getModuleTimetable,
  areLessonsSameClass,
  formatExamDate,
  getModuleExamDate,
} from 'utils/modules';
import {
  timetableLessonsArray,
  hydrateSemTimetableWithLessons,
  arrangeLessonsForWeek,
  areOtherClassesAvailable,
  lessonsForLessonType,
  findExamClashes,
  getSemesterModules,
} from 'utils/timetables';
import ModulesSelectContainer from 'views/timetable/ModulesSelectContainer';
import CorsNotification from 'views/components/cors-info/CorsNotification';
import Announcements from 'views/components/Announcements';
import Title from 'views/components/Title';
import RefreshPrompt from 'views/components/RefreshPrompt';
import Timetable from './Timetable';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';
import ExamCalendar from './ExamCalendar';
import styles from './TimetableContent.scss';

type Props = {
  // Own props
  readOnly: boolean,
  header: Node,
  semester: Semester,
  timetable: SemTimetableConfig,
  colors: ColorMapping,

  // From Redux
  timetableWithLessons: SemTimetableConfigWithLessons,
  modules: ModulesMap,
  activeLesson: ?Lesson,
  timetableOrientation: TimetableOrientation,
  showTitle: boolean,
  hiddenInTimetable: ModuleCode[],

  // Actions
  removeModule: (Semester, ModuleCode) => void,
  modifyLesson: Function,
  changeLesson: Function,
  cancelModifyLesson: Function,
  toggleTimetableOrientation: Function,
  toggleTitleDisplay: Function,
  openNotification: (string, NotificationOptions) => void,
  undo: () => void,
};

type State = {
  isScrolledHorizontally: boolean,
  showExamCalendar: boolean,
};

class TimetableContent extends Component<Props, State> {
  state: State = {
    isScrolledHorizontally: false,
    showExamCalendar: false,
  };

  componentWillUnmount() {
    this.cancelModifyLesson();
  }

  onScroll = (e: Event) => {
    // Only trigger when there is an active lesson
    const isScrolledHorizontally =
      !!this.props.activeLesson &&
      e.currentTarget instanceof HTMLElement &&
      e.currentTarget.scrollLeft > 0;
    if (this.state.isScrolledHorizontally !== isScrolledHorizontally) {
      this.setState({ isScrolledHorizontally });
    }
  };

  cancelModifyLesson = () => {
    if (this.props.activeLesson) {
      this.props.cancelModifyLesson();
    }
  };

  isHiddenInTimetable = (moduleCode: ModuleCode) =>
    this.props.hiddenInTimetable.includes(moduleCode);

  modifyCell = (lesson: Lesson) => {
    // $FlowFixMe When object spread type actually works
    if (lesson.isAvailable) {
      this.props.changeLesson(this.props.semester, lesson);
    } else if (lesson.isActive) {
      this.props.cancelModifyLesson();
    } else {
      this.props.modifyLesson(lesson);
    }
  };

  removeModule = (moduleCode) => {
    // Display alert on iPhones and iPod touches because snackbar action will take 2 taps
    // TODO: Replace with a more permanent solution
    // Using indexOf() as userAgent doesn't have contains()
    const { userAgent } = navigator;
    if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPod') !== -1) {
      const confirmMessage = `Are you sure you want to remove ${moduleCode}?`;
      if (window.confirm(confirmMessage)) {
        this.props.removeModule(this.props.semester, moduleCode);
      }
      return;
    }

    this.props.removeModule(this.props.semester, moduleCode);
    this.props.openNotification(`Removed ${moduleCode}`, {
      timeout: 12000,
      overwritable: true,
      action: {
        text: 'Undo',
        handler: this.props.undo,
      },
    });
  };

  // Returns modules currently in the timetable
  addedModules(): Array<Module> {
    const modules = getSemesterModules(this.props.timetableWithLessons, this.props.modules);
    return _.sortBy(modules, (module: Module) => getModuleExamDate(module, this.props.semester));
  }

  // Returns component with table(s) of modules
  renderModuleSections(horizontalOrientation) {
    const { readOnly } = this.props;

    const renderModuleTable = (modules) => (
      <TimetableModulesTable
        modules={modules.map((module) => ({
          ...module,
          colorIndex: this.props.colors[module.ModuleCode],
          hiddenInTimetable: this.isHiddenInTimetable(module.ModuleCode),
        }))}
        horizontalOrientation={horizontalOrientation}
        semester={this.props.semester}
        onRemoveModule={this.removeModule}
        readOnly={readOnly}
      />
    );

    // Separate added modules into sections of clashing modules
    const modules = this.addedModules();
    const clashes: { [string]: Array<Module> } = findExamClashes(modules, this.props.semester);
    const nonClashingMods: Array<Module> = _.difference(modules, _.flatten(_.values(clashes)));

    if (_.isEmpty(clashes) && _.isEmpty(nonClashingMods)) {
      return (
        <div className="row">
          <div className="col-sm-12">
            <p className="text-sm-center">No modules added.</p>
          </div>
        </div>
      );
    }

    return (
      <Fragment>
        {!_.isEmpty(clashes) && (
          <Fragment>
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
                  {renderModuleTable(clashes[clashDate])}
                </div>
              ))}
            <hr />
          </Fragment>
        )}
        {renderModuleTable(nonClashingMods)}
      </Fragment>
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
        const modifiableLesson: Object = {
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
    const coloredTimetableLessons = timetableLessons.map((lesson: Lesson): ColoredLesson => ({
      ...lesson,
      colorIndex: colors[lesson.ModuleCode],
    }));

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

    return (
      <div
        className={classnames('page-container', styles.container, {
          verticalMode: isVerticalOrientation,
        })}
        onClick={this.cancelModifyLesson}
        onKeyUp={(e) => e.keyCode === 27 && this.cancelModifyLesson()} // Quit modifying when Esc is pressed
      >
        <Title>Timetable</Title>

        <CorsNotification />

        <Announcements />

        <RefreshPrompt />

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
                modules={this.addedModules().map((module) => ({
                  ...module,
                  colorIndex: this.props.colors[module.ModuleCode],
                  hiddenInTimetable: this.isHiddenInTimetable(module.ModuleCode),
                }))}
              />
            ) : (
              <div className={styles.timetableWrapper} onScroll={this.onScroll}>
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
                  <ModulesSelectContainer semester={semester} timetable={this.props.timetable} />
                )}
              </div>

              <div className="col-md-12">{this.renderModuleSections(!isVerticalOrientation)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
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

export default connect(mapStateToProps, {
  removeModule,
  modifyLesson,
  changeLesson,
  cancelModifyLesson,
  openNotification,
  undo,
})(TimetableContent);
