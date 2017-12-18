// @flow
import React, { Component, type Node } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import _ from 'lodash';
import config from 'config';

import type { ModulesMap } from 'reducers/entities/moduleBank';
import type {
  ColorMapping,
  TimetableOrientation,
  ModuleSelectList,
} from 'types/reducers';
import { HORIZONTAL } from 'types/reducers';
import type {
  Lesson,
  Module,
  ModuleCode,
  Semester,
} from 'types/modules';
import type { SemTimetableConfig, SemTimetableConfigWithLessons, TimetableArrangement } from 'types/timetables';

import classnames from 'classnames';
import { getSemModuleSelectList } from 'reducers/entities/moduleBank';
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
import CorsNotification from 'views/components/cors-info/CorsNotification';

import styles from './TimetableContent.scss';
import Timetable from './Timetable';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';
import ShareTimetable from './ShareTimetable';

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
  downloadAsJpeg: Function,
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

  downloadAsJpeg = () => this.props.downloadAsJpeg(this.timetableDom);

  downloadAsIcal = () =>
    this.props.downloadAsIcal(this.props.semester, this.props.timetableWithLessons, this.props.modules);

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
    const modules = _.keys(this.props.timetableWithLessons)
      .sort((a, b) => a.localeCompare(b))
      .map(moduleCode => this.props.modules[moduleCode]);
    return _.compact(modules);
  }

  // Returns component with table(s) of modules
  renderModuleSections(horizontalOrientation) {
    const { readOnly } = this.props;

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
        readOnly={readOnly}
      />
    );

    // Separate added modules into sections of clashing modules
    const modules = this.addedModules();
    const clashes: { [string]: Array<Module> } = findExamClashes(modules, this.props.semester);
    const nonClashingMods: Array<Module> = _.difference(modules, _.flatten(_.values(clashes)));

    return (
      <div>
        {!_.isEmpty(clashes) && (
          <div className="alert alert-danger" role="alert">
            <h4>Exam Clashes</h4>
            <p>There are <strong>clashes</strong> in your exam timetable.</p>
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
    const { semester, modules, colors, activeLesson, timetableOrientation, readOnly } = this.props;

    let timetableLessons: Lesson[] = timetableLessonsArray(this.props.timetableWithLessons)
      // Do not process hidden modules
      .filter(lesson => !this.isHiddenInTimetable(lesson.ModuleCode));

    if (activeLesson) {
      const moduleCode = activeLesson.ModuleCode;
      // Remove activeLesson because it will appear again
      timetableLessons = timetableLessons.filter(lesson => !areLessonsSameClass(lesson, activeLesson));

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
    timetableLessons = timetableLessons.map((lesson): Lesson =>
      ({ ...lesson, colorIndex: colors[lesson.ModuleCode] }));

    const arrangedLessons = arrangeLessonsForWeek(timetableLessons);
    const arrangedLessonsWithModifiableFlag: TimetableArrangement = _.mapValues(arrangedLessons, dayRows =>
      dayRows.map(row =>
        row.map((lesson) => {
          const module: Module = modules[lesson.ModuleCode];
          const moduleTimetable = getModuleTimetable(module, semester);

          return {
            ...lesson,
            isModifiable: !readOnly && areOtherClassesAvailable(moduleTimetable, lesson.LessonType),
          };
        })));

    const isVerticalOrientation = timetableOrientation !== HORIZONTAL;

    return (
      <div
        className={classnames(styles.container, 'page-container')}
        onClick={this.cancelModifyLesson}
      >
        <Helmet>
          <title>Timetable - {config.brandName}</title>
        </Helmet>

        <CorsNotification />

        <div>
          {this.props.header}
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
            <div className="row justify-content-between">
              <div className={classnames('col-auto', styles.timetableActions)}>
                <TimetableActions
                  isVerticalOrientation={!isVerticalOrientation}
                  toggleTimetableOrientation={this.props.toggleTimetableOrientation}
                  downloadAsJpeg={this.downloadAsJpeg}
                  downloadAsIcal={this.downloadAsIcal}
                />
              </div>

              <div className={classnames('col-auto', styles.timetableActions)}>
                <ShareTimetable
                  semester={semester}
                  timetable={this.props.timetable}
                />
              </div>
            </div>
            <div className={styles.tableContainer}>
              <div className="col-md-12">
                {!readOnly &&
                  <ModulesSelect
                    moduleList={this.props.semModuleList}
                    onChange={(moduleCode) => {
                      this.props.addModule(semester, moduleCode.value);
                    }}
                    placeholder="Add module to timetable"
                  />}
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
  const modules = state.entities.moduleBank.modules;
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);
  const semModuleList = getSemModuleSelectList(state.entities.moduleBank, semester, timetable);
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
  downloadAsJpeg,
  downloadAsIcal,
})(TimetableContent);
