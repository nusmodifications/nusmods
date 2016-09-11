import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import _ from 'lodash';
import config from 'config';
import { addModule, removeModule } from 'actions/timetables';

import { timetableLessonsArray } from 'utils/timetable';
import Timetable from './Timetable';

export class TimetableContainer extends Component {
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

    const lessons = timetableLessonsArray(this.props.semesterTimetable);

    return (
      <div>
        <h1 className="display-4">Timetable</h1>
        <br/>
        <Timetable lessons={lessons}/>
        <br/>
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <VirtualizedSelect options={moduleSelectOptions}
              filterOptions={filterOptions}
              onChange={(module) => {
                this.props.addModule(this.props.semester, module.value);
              }}
            />
            <table className="table table-bordered">
              <tbody>
                {_.map(Object.keys(this.props.semesterTimetable), (moduleCode) => {
                  const module = this.props.modules[moduleCode] || {};
                  return (
                    <tr key={moduleCode}>
                      <td>{module.ModuleCode}</td>
                      <td>{module.ModuleTitle}</td>
                      <td>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => {
                            this.props.removeModule(this.props.semester, moduleCode);
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
  addModule: PropTypes.func,
  removeModule: PropTypes.func,
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
    modules: state.entities.moduleBank.modules,
  };
}

export default connect(
  mapStateToProps,
  {
    addModule,
    removeModule,
  }
)(TimetableContainer);
