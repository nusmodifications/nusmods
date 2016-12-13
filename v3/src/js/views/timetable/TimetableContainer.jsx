// @flow
/* eslint-disable no-duplicate-imports */
import type {
  ThemeState,
  TimetableOrientation,
} from 'types/reducers';
import {
  HORIZONTAL,
} from 'types/reducers';
import type {
  ModifiableLesson,
  Lesson,
  Module,
  ModuleCode,
  ModuleCondensed,
  RawLesson,
} from 'types/modules';
import type { SemTimetableConfig, TimetableArrangement } from 'types/timetables';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import autobind from 'react-autobind';
import _ from 'lodash';
import config from 'config';
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
import { getModuleTimetable, areLessonsSameClass } from 'utils/modules';
import {
  timetableLessonsArray,
  hydrateSemTimetableWithLessons,
  arrangeLessonsForWeek,
  areOtherClassesAvailable,
  lessonsForLessonType,
} from 'utils/timetables';
import ModulesSelect from 'views/components/ModulesSelect';

import Timetable from './Timetable';
import TimetableModulesTable from './TimetableModulesTable';

type Props = {
  semester: number,
  semModuleList: Array<ModuleCondensed>,
  semTimetableWithLessons: SemTimetableConfig,
  modules: Module,
  theme: string,
  colors: ThemeState,
  activeLesson: ModifiableLesson,
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
};

export class TimetableContainer extends Component {

  constructor(props: Props) {
    super(props);
    autobind(this);
  }

  componentWillUnmount() {
    this.props.cancelModifyLesson();
  }

  timetableDom: Element

  isHiddenInTimetable(moduleCode: ModuleCode) {
    return this.props.hiddenInTimetable.includes(moduleCode);
  }

  modifyCell(lesson: ModifiableLesson) {
    if (lesson.isAvailable) {
      this.props.changeLesson(this.props.semester, lesson);
    } else if (lesson.isActive) {
      this.props.cancelModifyLesson();
    } else {
      this.props.modifyLesson(lesson);
    }
  }

  render() {
    let timetableLessons: Array<Lesson | ModifiableLesson> = timetableLessonsArray(this.props.semTimetableWithLessons);
    if (this.props.activeLesson) {
      const activeLesson = this.props.activeLesson;
      const moduleCode = activeLesson.ModuleCode;

      const module = this.props.modules[moduleCode];
      const moduleTimetable: Array<RawLesson> = getModuleTimetable(module, this.props.semester);
      const lessons = lessonsForLessonType(moduleTimetable, activeLesson.LessonType)
        .map((lesson) => {
          // Inject module code in
          return { ...lesson, ModuleCode: moduleCode };
        });
      const otherAvailableLessons = lessons
        .filter((lesson) => {
          // Exclude the lesson being modified.
          return !areLessonsSameClass(lesson, activeLesson);
        })
        .map((lesson) => {
          return { ...lesson, isAvailable: true };
        });
      timetableLessons = timetableLessons.map((lesson) => {
        // Identify the current lesson being modified.
        if (areLessonsSameClass(lesson, activeLesson)) {
          return { ...lesson, isActive: true };
        }
        return lesson;
      });
      timetableLessons = [...timetableLessons, ...otherAvailableLessons];
    }

    // Inject color index into lessons.
    timetableLessons = timetableLessons.map((lesson) => {
      return { ...lesson, colorIndex: this.props.colors[lesson.ModuleCode] };
    });

    // inject hidden into lessons.
    timetableLessons = timetableLessons.filter(lesson => !this.isHiddenInTimetable(lesson.ModuleCode));

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

    const isHorizontalOrientation = this.props.timetableOrientation === HORIZONTAL;

    return (
      <DocumentTitle title={`Timetable - ${config.brandName}`}>
        <div className={`theme-${this.props.theme} timetable-page-container page-container`} onClick={() => {
          if (this.props.activeLesson) {
            this.props.cancelModifyLesson();
          }
        }}>
          <div className="row">
            <div className={classnames('timetable-wrapper', {
              'col-md-12': isHorizontalOrientation,
              'col-md-8': !isHorizontalOrientation,
            })}>
              <Timetable lessons={arrangedLessonsWithModifiableFlag}
                horizontalOrientation={isHorizontalOrientation}
                onModifyCell={this.modifyCell}
                ref={r => (this.timetableDom = r && r.timetableDom)}
              />
              <br/>
            </div>
            <div className={classnames({
              'col-md-12': isHorizontalOrientation,
              'col-md-4': !isHorizontalOrientation,
            })}>
              <div className="timetable-action-row text-xs-right">
                <button type="button"
                  className="btn btn-outline-primary"
                  onClick={this.props.toggleTimetableOrientation}
                >
                  <i className="fa fa-exchange"/>
                </button>
                <button type="button"
                  className="btn btn-outline-primary"
                  onClick={() => this.props.downloadAsJpeg(this.timetableDom)}
                >
                  <i className="fa fa-image"/>
                </button>
                <button type="button"
                  className="btn btn-outline-primary"
                  onClick={() => this.props.downloadAsIcal(
                    this.props.semester, this.props.semTimetableWithLessons, this.props.modules)}
                >
                  <i className="fa fa-calendar"/>
                </button>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <ModulesSelect moduleList={this.props.semModuleList}
                    onChange={(moduleCode) => {
                      this.props.addModule(this.props.semester, moduleCode.value);
                    }}
                    placeholder="Add module to timetable"
                  />
                  <br/>
                  <TimetableModulesTable modules={
                    Object.keys(this.props.semTimetableWithLessons).sort((a, b) => {
                      return a.localeCompare(b);
                    }).map((moduleCode) => {
                      const module = this.props.modules[moduleCode] || {};
                      // Inject color index.
                      module.colorIndex = this.props.colors[moduleCode];
                      module.hiddenInTimetable = this.isHiddenInTimetable(moduleCode);
                      return module;
                    })}
                    horizontalOrientation={isHorizontalOrientation}
                    semester={this.props.semester}
                    onRemoveModule={(moduleCode) => {
                      this.props.removeModule(this.props.semester, moduleCode);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

TimetableContainer.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  const modules = state.entities.moduleBank.modules;
  const semester = config.semester;
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
    theme: state.theme.id,
    colors: state.theme.colors,
    timetableOrientation: state.theme.timetableOrientation,
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
    toggleTimetableOrientation,
    downloadAsJpeg,
    downloadAsIcal,
  }
)(TimetableContainer);
