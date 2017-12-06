// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import _ from 'lodash';
import config from 'config';

import type {
  ThemeState,
  TimetableOrientation,
  ModuleSelectList,
} from 'types/reducers';
import { HORIZONTAL } from 'types/reducers';
import type {
  Lesson,
  Module,
  ModuleCode,
  RawLesson,
  Semester,
} from 'types/modules';
import type { SemTimetableConfig, TimetableArrangement } from 'types/timetables';

import classnames from 'classnames';
import { getSemModuleSelectList } from 'reducers/entities/moduleBank';
import { selectSemester } from 'actions/settings';
import { downloadAsJpeg, downloadAsIcal } from 'actions/export';
import {
  addModule,
  cancelModifyLesson,
  changeLesson,
  modifyLesson,
  removeModule,
} from 'actions/timetables';
import { toggleTimetableOrientation } from 'actions/theme';
import { getModuleTimetable, areLessonsSameClass, formatExamDate } from 'utils/modules';
import {
  timetableLessonsArray,
  hydrateSemTimetableWithLessons,
  arrangeLessonsForWeek,
  areOtherClassesAvailable,
  lessonsForLessonType,
  findExamClashes,
} from 'utils/timetables';
import ModulesSelect from 'views/components/ModulesSelect';
import SemesterSwitcher from 'views/components/semester-switcher/SemesterSwitcher';

import styles from './TimetableContainer.scss';
import Timetable from './Timetable';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';

type Props = {
  semester: Semester,
  semModuleList: ModuleSelectList,
  semTimetableWithLessons: SemTimetableConfig,
  modules: Module,
  colors: ThemeState,
  activeLesson: Lesson,
  timetableOrientation: TimetableOrientation,
  hiddenInTimetable: Array<ModuleCode>,

  addModule: Function,
  removeModule: Function,
  modifyLesson: Function,
  changeLesson: Function,
  cancelModifyLesson: Function,
  toggleTimetableOrientation: Function,
  downloadAsJpeg: Function,
  downloadAsIcal: Function,
  selectSemester: Function,
};

class TimetableContainer extends Component<Props> {
  timetableDom: ?HTMLElement;

  componentWillUnmount() {
    this.cancelModifyLesson();
  }

  cancelModifyLesson = () => {
    if (this.props.activeLesson) {
      this.props.cancelModifyLesson();
    }
  };

  downloadAsJpeg = () => this.props.downloadAsJpeg(this.timetableDom);

  downloadAsIcal = () =>
    this.props.downloadAsIcal(this.props.semester, this.props.semTimetableWithLessons, this.props.modules);

  isHiddenInTimetable = (moduleCode: ModuleCode) => {
    return this.props.hiddenInTimetable.includes(moduleCode);
  };

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
    const modules = _.keys(this.props.semTimetableWithLessons)
      .sort((a, b) => a.localeCompare(b))
      .map(moduleCode => this.props.modules[moduleCode]);
    return _.compact(modules);
  }

  // Returns component with table(s) of modules
  renderModuleSections(horizontalOrientation) {
    const renderModuleTable = modules => (
      <TimetableModulesTable
        modules={modules.map(module => ({
          ...module,
          colorIndex: this.props.colors[module.ModuleCode],
          hiddenInTimetable: this.isHiddenInTimetable(module.ModuleCode),
        }))}
        horizontalOrientation={horizontalOrientation}
        semester={this.props.semester}
        onRemoveModule={moduleCode => this.props.removeModule(this.props.semester, moduleCode)}
      />
    );

    // Separate added modules into sections of clashing modules
    const modules = this.addedModules();
    const clashes: { [string]: Array<Module> } = findExamClashes(modules, this.props.semester);
    const nonClashingMods: Array<Module> = _.difference(modules, _.flatten(_.values(clashes)));

    return (
      <div>
        {_.isEmpty(clashes) ? null : (
          <div className="alert alert-danger" role="alert">
            <h4>Exam Clashes</h4>
            <p>There are <strong className="clash">clashes</strong> in your exam timetable.</p>
            {Object.keys(clashes).sort().map(clashDate => (
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
    let timetableLessons: Array<Lesson> = timetableLessonsArray(this.props.semTimetableWithLessons)
      // Do not process hidden modules
      .filter(lesson => !this.isHiddenInTimetable(lesson.ModuleCode));

    if (this.props.activeLesson) {
      const activeLesson = this.props.activeLesson;
      const moduleCode = activeLesson.ModuleCode;
      // Remove activeLesson because it will appear again
      timetableLessons = timetableLessons.filter(lesson => !areLessonsSameClass(lesson, activeLesson));

      const module = this.props.modules[moduleCode];
      const moduleTimetable: Array<RawLesson> = getModuleTimetable(module, this.props.semester);
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
    timetableLessons = timetableLessons.map((lesson): Lesson => {
      return { ...lesson, colorIndex: this.props.colors[lesson.ModuleCode] };
    });

    const arrangedLessons: TimetableArrangement = arrangeLessonsForWeek(timetableLessons);
    const arrangedLessonsWithModifiableFlag: TimetableArrangement = _.mapValues(arrangedLessons, (dayRows) => {
      return dayRows.map((row) => {
        return row.map((lesson) => {
          const module: Module = this.props.modules[lesson.ModuleCode];
          const moduleTimetable: Array<RawLesson> = getModuleTimetable(module, this.props.semester);
          return {
            ...lesson,
            isModifiable: areOtherClassesAvailable(moduleTimetable, lesson.LessonType),
          };
        });
      });
    });

    const isVerticalOrientation = this.props.timetableOrientation !== HORIZONTAL;

    return (
      <div
        className={classnames(styles.container, 'page-container')}
        onClick={this.cancelModifyLesson}
      >
        <Helmet>
          <title>Timetable - {config.brandName}</title>
        </Helmet>
        <div>
          <SemesterSwitcher
            semester={this.props.semester}
            onSelectSemester={this.props.selectSemester}
          />
        </div>
        <div className="row">
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-8': isVerticalOrientation,
              verticalMode: isVerticalOrientation,
            })}
          >
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
            })}
          >
            <TimetableActions
              isVerticalOrientation={!isVerticalOrientation}
              toggleTimetableOrientation={this.props.toggleTimetableOrientation}
              downloadAsJpeg={this.downloadAsJpeg}
              downloadAsIcal={this.downloadAsIcal}
            />
            <div className={styles.tableContainer}>
              <div className="col-md-12">
                <ModulesSelect
                  moduleList={this.props.semModuleList}
                  onChange={(moduleCode) => {
                    this.props.addModule(this.props.semester, moduleCode.value);
                  }}
                  placeholder="Add module to timetable"
                />
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

function mapStateToProps(state) {
  const modules = state.entities.moduleBank.modules;
  const semester = state.app.activeSemester;
  const semTimetable = state.timetables[semester] || {};
  const semModuleList = getSemModuleSelectList(state.entities.moduleBank, semester, semTimetable);
  const semTimetableWithLessons = hydrateSemTimetableWithLessons(semTimetable, modules, semester);
  const hiddenInTimetable = state.settings.hiddenInTimetable || [];

  return {
    semester,
    semModuleList,
    semTimetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    colors: state.theme.colors,
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
  downloadAsJpeg,
  downloadAsIcal,
  selectSemester,
})(TimetableContainer);
