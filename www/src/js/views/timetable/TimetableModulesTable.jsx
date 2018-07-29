// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import type { ModuleCode, ModuleWithColor, Semester } from 'types/modules';
import type { ColorIndex } from 'types/reducers';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash2 } from 'views/components/icons/index';
import {
  showLessonInTimetable,
  hideLessonInTimetable,
  selectModuleColor,
} from 'actions/timetables';
import { getModuleExamDate, getFormattedModuleExamDate } from 'utils/modules';
import { modulePage } from 'views/routes/paths';
import elements from 'views/elements';

import styles from './TimetableModulesTable.scss';

type Props = {
  selectModuleColor: Function,
  hideLessonInTimetable: (Semester, ModuleCode) => void,
  showLessonInTimetable: (Semester, ModuleCode) => void,
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
    const { semester } = this.props;

    return (
      <div className={styles.moduleActionButtons}>
        <div className="btn-group">
          <button
            type="button"
            className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
            title={removeBtnLabel}
            aria-label={removeBtnLabel}
            onClick={() => this.props.onRemoveModule(module.ModuleCode)}
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
                this.props.showLessonInTimetable(semester, module.ModuleCode);
              } else {
                this.props.hideLessonInTimetable(semester, module.ModuleCode);
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

    const { readOnly, semester, horizontalOrientation } = this.props;

    return (
      <div className={classnames(styles.modulesTable, elements.moduleTable, 'row')}>
        {this.props.modules.map((module) => (
          <div
            className={classnames(styles.modulesTableRow, 'col-sm-6', {
              'col-lg-4': horizontalOrientation,
              'col-md-12': !horizontalOrientation,
            })}
            key={module.ModuleCode}
          >
            <div className={styles.moduleColor}>
              <ColorPicker
                isHidden={module.hiddenInTimetable}
                label={`Change ${module.ModuleCode} timetable color`}
                color={module.colorIndex}
                onChooseColor={(colorIndex: ColorIndex) => {
                  this.props.selectModuleColor(semester, module.ModuleCode, colorIndex);
                }}
              />
            </div>
            <div className={styles.moduleInfo}>
              {!readOnly && this.renderModuleActions(module)}
              <Link to={modulePage(module.ModuleCode, module.ModuleTitle)}>
                {module.ModuleCode} {module.ModuleTitle}
              </Link>
              <div className={styles.moduleExam}>
                {getModuleExamDate(module, semester)
                  ? `Exam: ${getFormattedModuleExamDate(module, semester)}`
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
