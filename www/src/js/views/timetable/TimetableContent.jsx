// @flow
import React, { Component, type Node } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import type { ModulesMap } from 'reducers/moduleBank';
import type {
  ColorMapping,
  TimetableOrientation,
  TitleDisplay,
  ModuleSelectList,
  NotificationOptions,
} from 'types/reducers';
import { HORIZONTAL, HIDE } from 'types/reducers';
import type { Lesson, Module, ModuleCode, Semester } from 'types/modules';
import type {
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
} from 'types/timetables';

import classnames from 'classnames';
import { getSemModuleSelectList } from 'reducers/moduleBank';
import {
  addModule,
  cancelModifyLesson,
  changeLesson,
  modifyLesson,
  removeModule,
  toggleTitleDisplay,
} from 'actions/timetables';
import { toggleTimetableOrientation } from 'actions/theme';
import { openNotification, popNotification } from 'actions/app';
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
import ModulesSelect from 'views/timetable/ModulesSelect';
import CorsNotification from 'views/components/cors-info/CorsNotification';
import Announcements from 'views/components/Announcements';
import Online from 'views/components/Online';
import Title from 'views/components/Title';
import Timetable from './Timetable';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';
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
  semModuleList: ModuleSelectList,
  modules: ModulesMap,
  activeLesson: ?Lesson,
  timetableOrientation: TimetableOrientation,
  titleDisplay: TitleDisplay,
  hiddenInTimetable: ModuleCode[],

  // Actions
  addModule: (Semester, ModuleCode) => void,
  removeModule: (Semester, ModuleCode) => void,
  modifyLesson: Function,
  changeLesson: Function,
  cancelModifyLesson: Function,
  toggleTimetableOrientation: Function,
  toggleTitleDisplay: Function,
  openNotification: (string, NotificationOptions) => void,
  popNotification: () => void,
  undo: () => void,
};

type State = {
  isScrolledHorizontally: boolean,
};

class TimetableContent extends Component<Props, State> {
  timetableDom: ?HTMLElement;
  timetableWrapperDom: ?HTMLElement;

  state: State = {
    isScrolledHorizontally: false,
  };

  componentDidMount() {
    if (this.timetableWrapperDom) {
      this.timetableWrapperDom.addEventListener('scroll', this.handleScroll, { passive: true });
    }
  }

  componentWillUnmount() {
    this.cancelModifyLesson();
    if (this.timetableWrapperDom) {
      this.timetableWrapperDom.removeEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll = () => {
    const isScrolledHorizontally =
      !!this.timetableWrapperDom && this.timetableWrapperDom.scrollLeft > 0;
    if (this.state.isScrolledHorizontally === isScrolledHorizontally) return;
    this.setState({ isScrolledHorizontally });
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
    const userAgent = navigator.userAgent;
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
      <div>
        {!_.isEmpty(clashes) && (
          <div>
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
          </div>
        )}
        {renderModuleTable(nonClashingMods)}
      </div>
    );
  }

  render() {
    const {
      semester,
      modules,
      colors,
      activeLesson,
      timetableOrientation,
      titleDisplay,
      readOnly,
    } = this.props;

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
        const modifiableLesson = {
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
    timetableLessons = timetableLessons.map((lesson): Lesson => ({
      ...lesson,
      colorIndex: colors[lesson.ModuleCode],
    }));

    const arrangedLessons = arrangeLessonsForWeek(timetableLessons);
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
    const showTitle = !isVerticalOrientation && titleDisplay !== HIDE;

    return (
      <div
        className={classnames('page-container', styles.container, {
          verticalMode: isVerticalOrientation,
        })}
        onClick={this.cancelModifyLesson}
      >
        <Title>Timetable</Title>

        <CorsNotification />

        <Announcements />

        <div>{this.props.header}</div>

        <div className="row">
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-8': isVerticalOrientation,
            })}
          >
            <div
              className={styles.timetableWrapper}
              ref={(r) => {
                this.timetableWrapperDom = r;
              }}
            >
              <Timetable
                lessons={arrangedLessonsWithModifiableFlag}
                isVerticalOrientation={isVerticalOrientation}
                isScrolledHorizontally={this.state.isScrolledHorizontally}
                showTitle={showTitle}
                onModifyCell={this.modifyCell}
                ref={(r) => {
                  this.timetableDom = r && r.timetableDom;
                }}
              />
            </div>
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
                  toggleTimetableOrientation={this.props.toggleTimetableOrientation}
                  showTitle={showTitle}
                  toggleTitleDisplay={this.props.toggleTitleDisplay}
                  semester={semester}
                  timetable={this.props.timetable}
                />
              </div>
            </div>
            <div className={styles.tableContainer}>
              {!readOnly && (
                <Online>
                  {(isOnline) => (
                    <div className={classnames('col-md-12', styles.modulesSelect)}>
                      <ModulesSelect
                        moduleList={this.props.semModuleList}
                        onChange={(moduleCode) => {
                          this.props.popNotification();
                          this.props.addModule(semester, moduleCode);
                        }}
                        placeholder={
                          isOnline
                            ? 'Add module to timetable'
                            : 'You need to be online to add modules'
                        }
                        disabled={!isOnline}
                      />
                    </div>
                  )}
                </Online>
              )}
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
  const semModuleList = getSemModuleSelectList(state.moduleBank, semester, timetable);
  const hiddenInTimetable = state.timetables.hidden[semester] || [];

  return {
    semester,
    semModuleList,
    timetable,
    timetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    timetableOrientation: state.theme.timetableOrientation,
    titleDisplay: state.timetables.titleDisplay,
    hiddenInTimetable,
  };
}

export default connect(mapStateToProps, {
  addModule,
  removeModule,
  modifyLesson,
  changeLesson,
  cancelModifyLesson,
  toggleTimetableOrientation,
  toggleTitleDisplay,
  openNotification,
  popNotification,
  undo,
})(TimetableContent);
