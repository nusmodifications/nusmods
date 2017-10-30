// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import type { ModuleWithColor, ModuleCode, Semester } from 'types/modules';
import type { ColorIndex } from 'types/reducers';

import ColorPicker from 'views/components/color-picker/ColorPicker';
import { Eye, EyeOff, Trash2 } from 'views/components/icons/index';
import { selectModuleColor, modifyModuleColor, cancelModifyModuleColor } from 'actions/theme';
import { hideLessonInTimetable, showLessonInTimetable } from 'actions/settings';
import { getModuleSemExamDate, modulePagePath } from 'utils/modules';

import styles from './TimetableModulesTable.scss';
import timetableActionsStyles from './TimetableActions.scss';

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

  render() {
    return (
      <div className={classnames(styles.modulesTable, 'row')}>
        {this.props.modules.length ?
          this.props.modules.map((module) => {
            const label = `${module.hiddenInTimetable ? 'Show' : 'Hide'} ${module.ModuleCode}`;
            return (
              <div
                className={classnames(styles.modulesTableRow, 'col-sm-6', {
                  'col-md-4': this.props.horizontalOrientation,
                  'col-md-12': !this.props.horizontalOrientation,
                })}
                key={module.ModuleCode}
              >
                <div className={styles.modulesTableRowInner}>
                  <div className={classnames(styles.moduleActionColumn, styles.moduleColorColumn)}>
                    <div
                      className={classnames(styles.moduleColor, {
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
                  <div className={classnames(styles.moduleActionColumn, styles.moduleDetailsColumn)}>
                    <Link to={modulePagePath(module.ModuleCode)}>
                      {module.ModuleCode} {module.ModuleTitle}
                    </Link>
                    <div>
                      <small>
                        Exam: {getModuleSemExamDate(module, this.props.semester)}
                        &nbsp;&middot;&nbsp;
                        {module.ModuleCredit} MCs
                      </small>
                    </div>
                  </div>
                  <div className={styles.moduleActionColumn}>
                    <div className="btn-group">
                      <button
                        className={`btn btn-outline-secondary ${styles.moduleAction}
                          ${timetableActionsStyles.actionButton}`}
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${module.ModuleCode}?`)) {
                            this.props.onRemoveModule(module.ModuleCode);
                          }
                        }}
                      >
                        <Trash2 className={timetableActionsStyles.actionIcon} />
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-secondary ${styles.moduleAction}
                          ${timetableActionsStyles.actionButton}`}
                        title={label}
                        aria-label={label}
                        onClick={() => {
                          if (module.hiddenInTimetable) {
                            this.props.showLessonInTimetable(module.ModuleCode);
                          } else {
                            this.props.hideLessonInTimetable(module.ModuleCode);
                          }
                        }}
                      >
                        {module.hiddenInTimetable ?
                          <EyeOff className={timetableActionsStyles.actionIcon} />
                          :
                          <Eye className={timetableActionsStyles.actionIcon} />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          :
          <div className="col-sm-12">
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
