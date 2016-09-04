import React, { Component } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import _ from 'lodash';
import classnames from 'classnames';
import axios from 'axios';

const CELLS_COUNT = 28;

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moduleList: {},
      selectedModules: [],
    };
  }

  componentDidMount() {
    axios.get('https://nusmods.com/api/2016-2017/1/moduleList.json').then((response) => {
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
    const moduleSelectOptions = Object.keys(this.state.moduleList)
      .filter((moduleCode) => {
        return !_.includes(this.state.selectedModules, moduleCode);
      })
      .map((moduleCode) => {
        return {
          value: moduleCode,
          label: `${moduleCode} ${this.state.moduleList[moduleCode]}`,
        };
      });

    return (
      <div>
        <h1>Timetable</h1>
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
                  return (
                    <tr key={moduleCode}>
                      <td>{moduleCode}</td>
                      <td>{this.state.moduleList[moduleCode]}</td>
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
