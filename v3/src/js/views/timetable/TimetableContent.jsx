// @flow
import React, { Component, type Node } from 'react';
import { connect } from 'react-redux';
import { withRouter, type ContextRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
import _ from 'lodash';
import classnames from 'classnames';

import type { ModulesMap } from 'reducers/entities/moduleBank';
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
  Semester,
} from 'types/modules';
import type { SemTimetableConfig, SemTimetableConfigWithLessons, TimetableArrangement } from 'types/timetables';

import config from 'config';
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

import styles from './TimetableContent.scss';
import Timetable from './Timetable';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';

type Props = {
  ...ContextRouter,

  header: Node,
  semester: Semester,
  semModuleList: ModuleSelectList,
  timetable: SemTimetableConfig,
  timetableWithLessons: SemTimetableConfigWithLessons,
  modules: ModulesMap,
  colors: ThemeState,
  activeLesson: Lesson,
  timetableOrientation: TimetableOrientation,
  hiddenInTimetable: ModuleCode[],

  addModule: Function,
  removeModule: Function,
  modifyLesson: Function,
  changeLesson: Function,
  cancelModifyLesson: Function,
  toggleTimetableOrientation: Function,
  downloadAsJpeg: Function,
  downloadAsIcal: Function,
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

  render() {
    const { timetable, semester, modules, colors, activeLesson, timetableOrientation } = this.props;

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
    timetableLessons = timetableLessons.map((lesson): Lesson => {
      return { ...lesson, colorIndex: colors[lesson.ModuleCode] };
    });

    const arrangedLessons = arrangeLessonsForWeek(timetableLessons);
    const arrangedLessonsWithModifiableFlag: TimetableArrangement = _.mapValues(arrangedLessons, dayRows =>
      dayRows.map(row =>
        row.map((lesson) => {
          const module: Module = modules[lesson.ModuleCode];
          const moduleTimetable = getModuleTimetable(module, semester);
          return {
            ...lesson,
            isModifiable: areOtherClassesAvailable(moduleTimetable, lesson.LessonType),
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
            <TimetableActions
              isVerticalOrientation={!isVerticalOrientation}
              toggleTimetableOrientation={this.props.toggleTimetableOrientation}
              downloadAsJpeg={this.downloadAsJpeg}
              downloadAsIcal={this.downloadAsIcal}
            />
            <div className="row mt-2">
              <div className="col-md-12">
                <ModulesSelect
                  moduleList={this.props.semModuleList}
                  onChange={(moduleCode) => {
                    this.props.addModule(semester, moduleCode.value);
                  }}
                  placeholder="Add module to timetable"
                />
                <br />
                <TimetableModulesTable
                  modules={
                    Object.keys(timetable)
                      .sort((a, b) => a.localeCompare(b))
                      .map(moduleCode => ({
                        ...modules[moduleCode],
                        colorIndex: colors[moduleCode],
                        hiddenInTimetable: this.isHiddenInTimetable(moduleCode),
                      }))
                  }
                  horizontalOrientation={!isVerticalOrientation}
                  semester={semester}
                  onRemoveModule={(moduleCode) => {
                    this.props.removeModule(semester, moduleCode);
                  }}
                />
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
    semModuleList,
    timetable,
    timetableWithLessons,
    modules,
    activeLesson: state.app.activeLesson,
    colors: state.theme.colors,
    timetableOrientation: state.theme.timetableOrientation,
    hiddenInTimetable,
  };
}

export default withRouter(
  connect(mapStateToProps, {
    addModule,
    removeModule,
    modifyLesson,
    changeLesson,
    cancelModifyLesson,
    toggleTimetableOrientation,
    downloadAsJpeg,
    downloadAsIcal,
  })(TimetableContainer),
);
