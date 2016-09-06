import React, { Component } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import _ from 'lodash';
import classnames from 'classnames';
import axios from 'axios';
import config from 'config';
import NUSModsApi from 'utils/nusmods-api';

const CELLS_COUNT = 28;

export default class TimetableContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moduleList: [],
      selectedModules: [],
    };
  }

  componentDidMount() {
    axios.get(NUSModsApi.moduleListUrl()).then((response) => {
      this.setState({
        moduleList: response.data,
      });
    });
  }
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
    const moduleSelectOptions = this.state.moduleList
      .filter((module) => {
        return !_.includes(this.state.selectedModules, module.ModuleCode) &&
                _.includes(module.Semesters, config.semester);
      })
      .map((module) => {
        return {
          value: module.ModuleCode,
          label: `${module.ModuleCode} ${module.ModuleTitle}`,
        };
      });

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
              onChange={(module) => {
                const selectedModules = this.state.selectedModules;
                if (!_.includes(selectedModules, module.value)) {
                  this.setState({
                    selectedModules: [...selectedModules, module.value],
                  });
                }
              }}
            />
            <table className="table table-bordered">
              <tbody>
                {_.map(this.state.selectedModules, (moduleCode) => {
                  const module = _.find(this.state.moduleList, (mod) => {
                    return mod.ModuleCode === moduleCode;
                  });
                  return (
                    <tr key={module.ModuleCode}>
                      <td>{module.ModuleCode}</td>
                      <td>{module.ModuleTitle}</td>
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
