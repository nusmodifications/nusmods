// @flow
import React, { Component, type Node } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import _ from 'lodash';
import config from 'config';

import type { ModulesMap } from 'reducers/moduleBank';
import type { ColorMapping, TimetableOrientation, ModuleSelectList } from 'types/reducers';
import { HORIZONTAL } from 'types/reducers';
import type { Lesson, Module, ModuleCode, Semester } from 'types/modules';
import type {
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
} from 'types/timetables';

import classnames from 'classnames';
import { getSemModuleSelectList } from 'reducers/moduleBank';
import { downloadAsImage, downloadAsIcal } from 'actions/export';
import {
  addModule,
  cancelModifyLesson,
  changeLesson,
  modifyLesson,
  removeModule,
} from 'actions/timetables';
import { toggleTimetableOrientation } from 'actions/theme';
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
import Timetable from './Timetable';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';
import styles from './TimetableContent.scss';

type Props = {
  header: Node,
  semester: Semester,
  semModuleList: ModuleSelectList,
  timetable: SemTimetableConfig,
  timetableWithLessons: SemTimetableConfigWithLessons,
  modules: ModulesMap,
  colors: ColorMapping,
  activeLesson: Lesson,
  timetableOrientation: TimetableOrientation,
  hiddenInTimetable: ModuleCode[],
  readOnly: boolean,

  addModule: Function,
  removeModule: Function,
  modifyLesson: Function,
  changeLesson: Function,
  cancelModifyLesson: Function,
  toggleTimetableOrientation: Function,
  downloadAsImage: Function,
  downloadAsIcal: Function,
};

class TimetableContent extends Component<Props> {
  timetableDom: ?HTMLElement;

  componentWillUnmount() {
    this.cancelModifyLesson();
  }

  cancelModifyLesson = () => {
    if (this.props.activeLesson) {
      this.props.cancelModifyLesson();
    }
  };

  downloadAsImage = () => this.props.downloadAsImage(this.timetableDom);

  downloadAsIcal = () =>
    this.props.downloadAsIcal(
      this.props.semester,
      this.props.timetableWithLessons,
      this.props.modules,
    );

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
        onRemoveModule={(moduleCode) => this.props.removeModule(this.props.semester, moduleCode)}
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
          <div className="alert alert-danger" role="alert">
            <h4>Exam Clashes</h4>
            <p>These modules have clashing exams.</p>
            {Object.keys(clashes)
              .sort()
              .map((clashDate) => (
                <div key={clashDate}>
                  <h5>Clash on {formatExamDate(clashDate)}</h5>
                  {renderModuleTable(clashes[clashDate])}
                </div>
              ))}
          </div>
        )}
        {renderModuleTable(nonClashingMods)}
      </div>
    );
  }

  render() {
    const { semester, modules, colors, activeLesson, timetableOrientation, readOnly } = this.props;

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

    return (
      <div
        className={classnames('page-container', styles.container, {
          verticalMode: isVerticalOrientation,
        })}
        onClick={this.cancelModifyLesson}>
        <Helmet>
          <title>Timetable - {config.brandName}</title>
        </Helmet>

        <CorsNotification />

        <Announcements />

        <div>{this.props.header}</div>

        <div className="row">
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-8': isVerticalOrientation,
            })}>
            <div className={styles.timetableWrapper}>
              <Timetable
                lessons={arrangedLessonsWithModifiableFlag}
                isVerticalOrientation={isVerticalOrientation}
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
            })}>
            <div className="row">
              <div className="col-12">
                <TimetableActions
                  isVerticalOrientation={isVerticalOrientation}
                  toggleTimetableOrientation={this.props.toggleTimetableOrientation}
                  downloadAsImage={this.downloadAsImage}
                  downloadAsIcal={this.downloadAsIcal}
                  semester={semester}
                  timetable={this.props.timetable}
                />
              </div>
            </div>
            <div className={styles.tableContainer}>
              <div className="col-md-12">
                {!readOnly && (
                  <Online>
                    {(isOnline) => (
                      <ModulesSelect
                        moduleList={this.props.semModuleList}
                        onChange={(moduleCode) => {
                          this.props.addModule(semester, moduleCode);
                        }}
                        placeholder={
                          isOnline
                            ? 'Add module to timetable'
                            : 'You need to be online to add modules'
                        }
                        disabled={!isOnline}
                      />
                    )}
                  </Online>
                )}
                <br />
                {this.renderModuleSections(!isVerticalOrientation)}
              </div>
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
  const hiddenInTimetable = state.settings.hiddenInTimetable || [];

  return {
    semester,
    semModuleList,
    timetable,
    timetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    timetableOrientation: state.theme.timetableOrientation,
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
  downloadAsImage,
  downloadAsIcal,
})(TimetableContent);
