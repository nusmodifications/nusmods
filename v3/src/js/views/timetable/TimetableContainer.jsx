import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import autobind from 'react-autobind';
import _ from 'lodash';
import config from 'config';
import { getSemModuleSelectList } from 'reducers/entities/moduleBank';
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
import ModulesSelect from 'views/components/ModulesSelect';

import Timetable from './Timetable';
import TimetableModulesTable from './TimetableModulesTable';

export class TimetableContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddingModule: false,
    };
    autobind(this);
  }

  componentWillUnmount() {
    this.props.cancelModifyLesson();
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
    let timetableLessons = timetableLessonsArray(this.props.semTimetable);
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
      <DocumentTitle title={`Timetable - ${config.brandName}`}>
        <div className={`theme-${this.props.theme}`} onClick={() => {
          if (this.props.activeLesson) {
            this.props.cancelModifyLesson();
          }
        }}>
          <div className="timetable-wrapper"
            onClick={() => {
            // TODO: Currently this onClick doesn't trigger if you click on a cell directly.
            //       Should capture the click on div too.
              this.setState({ isAddingModule: false });
            }}
          >
            <Timetable lessons={arrangedLessonsWithModifiableFlag}
              onModifyCell={this.modifyCell}
            />
          </div>
          <br/>
          <div className="row">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-11">
                  {this.state.isAddingModule &&
                    <ModulesSelect moduleList={this.props.semModuleList}
                      onChange={(moduleCode) => {
                        this.props.addModule(this.props.semester, moduleCode.value);
                      }}
                    />
                  }
                </div>
                <div className="col-md-1">
                  <button className="btn btn-sm btn-primary btn-block" onClick={() => {
                    // TODO: Focus on ModulesSelect input when button is clicked.
                    this.setState({
                      isAddingModule: !this.state.isAddingModule,
                    });
                  }}>{this.state.isAddingModule ? 'Cancel' : 'Add'}</button>
                </div>
              </div>
              <br/>
              <TimetableModulesTable modules={
                Object.keys(this.props.semTimetable).sort((a, b) => {
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
      </DocumentTitle>
    );
  }
}

TimetableContainer.propTypes = {
  semester: PropTypes.number,
  semModuleList: PropTypes.array,
  semTimetable: PropTypes.object,
  modules: PropTypes.object,
  theme: PropTypes.string,
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
