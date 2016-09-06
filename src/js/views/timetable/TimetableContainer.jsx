import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import _ from 'lodash';
import classnames from 'classnames';
import config from 'config';
import { addModule, removeModule } from 'actions/timetables';

const CELLS_COUNT = 28;

export class TimetableContainer extends Component {
  renderRow(day) {
    return (
      <div className="timetable-day-row">
        <div className="timetable-day-cell timetable-hour-cell"><span>{day}</span></div>
        {_.map(_.range(CELLS_COUNT), (i) => <div key={i} className="timetable-hour-cell"/>)}
      </div>
    );
  }

  renderTimetableBackground() {
    return (
      <div className="timetable-day-row">
        <div className="timetable-day-cell timetable-hour-cell"/>
        {_.map(_.range(CELLS_COUNT), (i) => {
          return (
            <div key={i}
              className={classnames('timetable-hour-cell', {
                'timetable-hour-cell-alt': i % 4 <= 1,
              })}
            />
          );
        })}
      </div>
    );
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

    return (
      <div>
        <h1 className="display-4">Timetable</h1>
        <br/>
        <div className="row">
          <div className="col-md-12">
            <div className="timetable-container">
              <div className="timetable">
                <div className="timetable-day">
                  <div className="timetable-day-row">
                    <div className="timetable-day-cell timetable-hour-cell"><span>Mon</span></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
                      <div className="test-cell"/>
                    </div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
                      <div className="test-cell"/>
                    </div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                  </div>
                  <div className="timetable-day-row">
                    <div className="timetable-day-cell timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-hour-cell-alt"><span/></div>
                    <div className="timetable-hour-cell timetable-hour-cell-alt"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
                      <div className="test-cell"/>
                    </div>
                    <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
                      <div className="test-cell"/>
                    </div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                    <div className="timetable-hour-cell"><span/></div>
                    <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
                  </div>
                </div>
                <div className="timetable-day">
                  {this.renderRow('Tue')}
                </div>
                <div className="timetable-day">
                  {this.renderRow('Wed')}
                </div>
                <div className="timetable-day">
                  {this.renderRow('Thu')}
                </div>
                <div className="timetable-day">
                  {this.renderRow('Fri')}
                </div>
              </div>
              <div className="timetable timetable-bg">
                <div className="timetable-day">
                  {this.renderTimetableBackground()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <VirtualizedSelect options={moduleSelectOptions}
              filterOptions={filterOptions}
              onChange={(module) => {
                this.props.addModule(this.props.semester, module.value);
              }}
            />
            <table className="table table-bordered">
              <tbody>
                {_.map(Object.keys(this.props.semesterTimetable), (moduleCode) => {
                  const module = _.find(this.props.semesterModuleList, (mod) => {
                    return mod.ModuleCode === moduleCode;
                  });
                  return (
                    <tr key={module.ModuleCode}>
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
    semesterModuleList: state.entities.moduleBank.moduleList.filter((module) => {
      return _.includes(module.Semesters, semester);
    }),
    semesterTimetable: state.timetables[semester] || {},
  };
}

export default connect(
  mapStateToProps,
  {
    addModule,
    removeModule,
  }
)(TimetableContainer);
