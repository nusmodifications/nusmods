import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import autobind from 'react-autobind';
import _ from 'lodash';
import config from 'config';

import {
  addModule,
  removeModule,
  modifyLesson,
  changeLesson,
  cancelModifyLesson,
} from 'actions/timetables';
import { getModuleTimetable, areLessonsSameClass } from 'utils/modules';
import {
  timetableLessonsArray,
  arrangeLessonsForWeek,
  areOtherClassesAvailable,
  lessonsForLessonType,
} from 'utils/timetable';

import Timetable from './Timetable';
import TimetableModulesTable from './TimetableModulesTable';

export class TimetableContainer extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  modifyCell(lesson) {
    if (lesson.isAvailable) {
      this.props.changeLesson(this.props.semester, lesson);
    } else if (lesson.isActive) {
      this.props.cancelModifyLesson();
    } else {
      this.props.modifyLesson(lesson);
    }
  }

  render() {
    const moduleSelectOptions = this.props.semesterModuleList
      .filter((module) => {
        return !this.props.semesterTimetable[module.ModuleCode];
      })
      .map((module) => {
        return {
          value: module.ModuleCode,
          label: `${module.ModuleCode} ${module.ModuleTitle}`,
        };
      });
    const filterOptions = createFilterOptions({ options: moduleSelectOptions });

    let timetableLessons = timetableLessonsArray(this.props.semesterTimetable);
    if (this.props.activeLesson) {
      const activeLesson = this.props.activeLesson;
      const moduleCode = activeLesson.ModuleCode;

      const module = this.props.modules[moduleCode];
      const moduleTimetable = getModuleTimetable(module, this.props.semester);
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

    const arrangedLessons = arrangeLessonsForWeek(timetableLessons);
    const arrangedLessonsWithModifiableFlag = _.mapValues(arrangedLessons, (dayRows) => {
      return _.map(dayRows, (row) => {
        return _.map(row, (lesson) => {
          const module = this.props.modules[lesson.ModuleCode];
          const moduleTimetable = getModuleTimetable(module, this.props.semester);
          return {
            ...lesson,
            isModifiable: areOtherClassesAvailable(moduleTimetable, lesson.LessonType),
          };
        });
      });
    });

    return (
      <div onClick={() => {
        if (this.props.activeLesson) {
          this.props.cancelModifyLesson();
        }
      }}>
        <Timetable lessons={arrangedLessonsWithModifiableFlag}
          onModifyCell={this.modifyCell}
        />
        <br/>
        <div className="row">
          <div className="col-md-12">
            <VirtualizedSelect options={moduleSelectOptions}
              filterOptions={filterOptions}
              onChange={(module) => {
                this.props.addModule(this.props.semester, module.value);
              }}
            />
            <TimetableModulesTable modules={
              Object.keys(this.props.semesterTimetable).sort((a, b) => {
                return a > b;
              }).map((moduleCode) => {
                return this.props.modules[moduleCode] || {};
              })}
              semester={this.props.semester}
              onRemoveModule={(moduleCode) => {
                this.props.removeModule(this.props.semester, moduleCode);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

TimetableContainer.propTypes = {
  semester: PropTypes.number,
  semesterModuleList: PropTypes.array,
  semesterTimetable: PropTypes.object,
  modules: PropTypes.object,
  colors: PropTypes.object,
  activeLesson: PropTypes.object,

  addModule: PropTypes.func,
  removeModule: PropTypes.func,
  modifyLesson: PropTypes.func,
  changeLesson: PropTypes.func,
  cancelModifyLesson: PropTypes.func,
};

TimetableContainer.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  const semester = config.semester;
  return {
    semester,
    // TODO: Shift selector into reducer
    //       https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    semesterModuleList: state.entities.moduleBank.moduleList.filter((module) => {
      return _.includes(module.Semesters, semester);
    }),
    semesterTimetable: state.timetables[semester] || {},
    activeLesson: state.app.activeLesson,
    colors: state.theme.colors,
    modules: state.entities.moduleBank.modules,
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
  }
)(TimetableContainer);
