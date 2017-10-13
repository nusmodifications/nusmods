// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import type { ModuleWithColor, ModuleCode, Semester } from 'types/modules';
import type { ColorIndex } from 'types/reducers';

import ColorPicker from 'views/components/color-picker/ColorPicker';
import { Eye, EyeOff } from 'views/components/icons/index';
import { selectModuleColor, modifyModuleColor, cancelModifyModuleColor } from 'actions/theme';
import { hideLessonInTimetable, showLessonInTimetable } from 'actions/settings';
import { getModuleSemExamDate, modulePagePath } from 'utils/modules';

import styles from './TimetableModulesTable.scss';

type Props = {
  activeModule: ModuleCode,
  selectModuleColor: Function,
  modifyModuleColor: Function,
  cancelModifyModuleColor: Function,
  hideLessonInTimetable: Function,
  showLessonInTimetable: Function,
  semester: Semester,
  modules: Array<ModuleWithColor>,
  onRemoveModule: Function,
  horizontalOrientation: boolean,
};

class TimetableModulesTable extends Component<Props> {
  componentWillUnmount() {
    this.cancelModifyModuleColor();
  }

  cancelModifyModuleColor = () => {
    if (this.props.activeModule) {
      this.props.cancelModifyModuleColor();
    }
  };

  showButton(moduleCode) {
    return (
      <button
        className={`btn btn-link ${styles.moduleAction}`}
        title="Show"
        aria-label="Show"
        onClick={() => this.props.showLessonInTimetable(moduleCode)}
      >
        <EyeOff className={styles.eyeIcon} />
      </button>
    );
  }

  hideButton(moduleCode) {
    return (
      <button
        className={`btn btn-link ${styles.moduleAction}`}
        title="Hide"
        aria-label="Hide"
        onClick={() => this.props.hideLessonInTimetable(moduleCode)}
      >
        <Eye className={styles.eyeIcon} />
      </button>
    );
  }

  render() {
    return (
      <div className="modules-table row">
        {this.props.modules.length ?
          this.props.modules.map((module) => {
            return (
              <div
                className={classnames('modules-table-row', {
                  'col-md-4': this.props.horizontalOrientation,
                  'col-md-12': !this.props.horizontalOrientation,
                })}
                key={module.ModuleCode}
              >
                <div className="modules-table-row-inner">
                  <div className="color-column">
                    <div
                      className={classnames('modules-table-color', {
                        [`color-${module.colorIndex}`]: !module.hiddenInTimetable,
                        'color-muted': module.hiddenInTimetable,
                      })}
                      onClick={() => {
                        if (this.props.activeModule === module.ModuleCode) {
                          this.props.cancelModifyModuleColor();
                        } else {
                          this.props.modifyModuleColor(module.ModuleCode);
                        }
                      }}
                    />
                    {this.props.activeModule === module.ModuleCode &&
                      <ColorPicker
                        onChooseColor={(colorIndex: ColorIndex) => {
                          this.props.selectModuleColor(module.ModuleCode, colorIndex);
                        }}
                        onDismiss={this.cancelModifyModuleColor}
                      />
                    }
                  </div>
                  <div className="module-details-column">
                    <Link to={modulePagePath(module.ModuleCode)}>
                      {module.ModuleCode} {module.ModuleTitle}
                    </Link>
                    <div>
                      <small>
                        Exam: {getModuleSemExamDate(module, this.props.semester)}
                        &nbsp;&middot;&nbsp;
                        {module.ModuleCredit} MCs
                        &nbsp;&middot;
                        <button
                          className={`btn btn-link ${styles.moduleAction}`}
                          onClick={() => this.props.onRemoveModule(module.ModuleCode)}
                        >
                          Remove
                        </button>
                        {module.hiddenInTimetable ?
                          this.showButton(module.ModuleCode) : this.hideButton(module.ModuleCode)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          : <div className="col-sm-12">
            <p className="text-sm-center">No modules added.</p>
          </div>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeModule: state.app.activeModule,
  };
}

export default connect(
  mapStateToProps,
  {
    selectModuleColor,
    modifyModuleColor,
    cancelModifyModuleColor,
    hideLessonInTimetable,
    showLessonInTimetable,
  },
)(TimetableModulesTable);
