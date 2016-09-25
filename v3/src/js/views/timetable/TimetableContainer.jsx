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
  DraggableLesson,
  Lesson,
  Module,
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
  arrangeLessonsForWeek,
  areOtherClassesAvailable,
  lessonsForLessonType,
} from 'utils/timetable';
import ModulesSelect from 'views/components/ModulesSelect';

import Timetable from './Timetable';
import TimetableModulesTable from './TimetableModulesTable';

type Props = {
  semester: number,
  semModuleList: Array<ModuleCondensed>,
  semTimetable: SemTimetableConfig,
  modules: Module,
  theme: string,
  colors: ThemeState,
  activeLesson: DraggableLesson,
  timetableOrientation: TimetableOrientation,

  addModule: Function,
  removeModule: Function,
  modifyLesson: Function,
  changeLesson: Function,
  cancelModifyLesson: Function,
  toggleTimetableOrientation: Function,
};

export class TimetableContainer extends Component {
  constructor(props: Props) {
    super(props);
    autobind(this);
  }

  componentWillUnmount() {
    this.props.cancelModifyLesson();
  }

  modifyCell(lesson: DraggableLesson) {
    if (lesson.isAvailable) {
      this.props.changeLesson(this.props.semester, lesson);
    } else if (lesson.isActive) {
      this.props.cancelModifyLesson();
    } else {
      this.props.modifyLesson(lesson);
    }
  }

  render() {
    let timetableLessons: Array<Lesson | DraggableLesson> = timetableLessonsArray(this.props.semTimetable);
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

    const arrangedLessons: TimetableArrangement = arrangeLessonsForWeek(timetableLessons);
    const arrangedLessonsWithModifiableFlag: Array<DraggableLesson> = _.mapValues(arrangedLessons, (dayRows) => {
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
              />
              <br/>
            </div>
            <div className={classnames('timetable-wrapper', {
              'col-md-12': isHorizontalOrientation,
              'col-md-4': !isHorizontalOrientation,
            })}>
              <div className="row">
                <div className="col-md-10">
                  <ModulesSelect moduleList={this.props.semModuleList}
                    onChange={(moduleCode) => {
                      this.props.addModule(this.props.semester, moduleCode.value);
                    }}
                    placeholder="Add module to timetable"
                  />
                  <br/>
                  <TimetableModulesTable modules={
                    Object.keys(this.props.semTimetable).sort((a, b) => {
                      return a.localeCompare(b);
                    }).map((moduleCode) => {
                      return this.props.modules[moduleCode] || {};
                    })}
                    semester={this.props.semester}
                    onRemoveModule={(moduleCode) => {
                      this.props.removeModule(this.props.semester, moduleCode);
                    }}
                  />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary" onClick={this.props.toggleTimetableOrientation}>
                    <i className="fa fa-rotate-right"/>
                  </button>
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
  const semester = config.semester;
  const semTimetable = state.timetables[semester] || {};
  const semModuleList = getSemModuleSelectList(state.entities.moduleBank, semester, semTimetable);

  return {
    semester,
    semModuleList,
    semTimetable,
    activeLesson: state.app.activeLesson,
    theme: state.theme.id,
    colors: state.theme.colors,
    modules: state.entities.moduleBank.modules,
    timetableOrientation: state.theme.timetableOrientation,
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
  }
)(TimetableContainer);
