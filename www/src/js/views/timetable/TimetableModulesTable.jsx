// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import type { ModuleWithColor, Semester } from 'types/modules';
import type { ColorIndex } from 'types/reducers';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash2 } from 'views/components/icons/index';
import { selectModuleColor } from 'actions/timetables';
import { hideLessonInTimetable, showLessonInTimetable } from 'actions/settings';
import { getModuleExamDate, getFormattedModuleExamDate } from 'utils/modules';
import { modulePage } from 'views/routes/paths';

import styles from './TimetableModulesTable.scss';

type Props = {
  selectModuleColor: Function,
  hideLessonInTimetable: Function,
  showLessonInTimetable: Function,
  semester: Semester,
  modules: Array<ModuleWithColor>,
  onRemoveModule: Function,
  horizontalOrientation: boolean,
  readOnly: boolean,
};

class TimetableModulesTable extends Component<Props> {
  renderModuleActions(module) {
    const hideBtnLabel = `${module.hiddenInTimetable ? 'Show' : 'Hide'} ${module.ModuleCode}`;
    const removeBtnLabel = `Remove ${module.ModuleCode} from timetable`;

    return (
      <div className={styles.moduleActionButtons}>
        <div className="btn-group">
          <button
            type="button"
            className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
            title={removeBtnLabel}
            aria-label={removeBtnLabel}
            onClick={() => {
              const confirmMessage = `Are you sure you want to remove ${module.ModuleCode}?`;
              if (window.confirm(confirmMessage)) {
                this.props.onRemoveModule(module.ModuleCode);
              }
            }}
          >
            <Trash2 className={styles.actionIcon} />
          </button>
          <button
            type="button"
            className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
            title={hideBtnLabel}
            aria-label={hideBtnLabel}
            onClick={() => {
              if (module.hiddenInTimetable) {
                this.props.showLessonInTimetable(module.ModuleCode);
              } else {
                this.props.hideLessonInTimetable(module.ModuleCode);
              }
            }}
          >
            {module.hiddenInTimetable ? (
              <Eye className={styles.actionIcon} />
            ) : (
              <EyeOff className={styles.actionIcon} />
            )}
          </button>
        </div>
      </div>
    );
  }

  render() {
    if (!this.props.modules.length) {
      return null;
    }

    return (
      <div className={classnames(styles.modulesTable, 'row')}>
        {this.props.modules.map((module) => (
          <div
            className={classnames(styles.modulesTableRow, 'col-sm-6', {
              'col-lg-4': this.props.horizontalOrientation,
              'col-md-12': !this.props.horizontalOrientation,
            })}
            key={module.ModuleCode}
          >
            <div className={styles.moduleColor}>
              <ColorPicker
                label={`Change ${module.ModuleCode} timetable color`}
                color={module.colorIndex}
                onChooseColor={(colorIndex: ColorIndex) => {
                  this.props.selectModuleColor(module.ModuleCode, colorIndex);
                }}
              />
            </div>
            <div className={styles.moduleInfo}>
              {!this.props.readOnly && this.renderModuleActions(module)}
              <Link to={modulePage(module.ModuleCode, module.ModuleTitle)}>
                {module.ModuleCode} {module.ModuleTitle}
              </Link>
              <div className={styles.moduleExam}>
                {getModuleExamDate(module, this.props.semester)
                  ? `Exam: ${getFormattedModuleExamDate(module, this.props.semester)}`
                  : 'No Exam'}
                &nbsp;&middot;&nbsp;
                {module.ModuleCredit} MCs
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default connect(null, {
  selectModuleColor,
  hideLessonInTimetable,
  showLessonInTimetable,
})(TimetableModulesTable);
