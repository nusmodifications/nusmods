// @flow

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { sum, sortBy, map } from 'lodash';

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
import { NBSP } from 'utils/react';
import { modulePage } from 'views/routes/paths';

import styles from './TimetableModulesTable.scss';

type ModuleOrder = {
  label: string,
  orderBy: (ModuleWithColor, Semester) => string | number,
};

const moduleOrders = {
  exam: { label: 'Exam Date', orderBy: (module, semester) => getModuleExamDate(module, semester) },
  mc: ({ label: 'Module Credits', orderBy: (module) => module.ModuleCredit }: ModuleOrder),
  code: ({ label: 'Module Code', orderBy: (module) => module.ModuleCode }: ModuleOrder),
};

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

type State = {
  moduleOrder: $Keys<typeof moduleOrders>,
};

function renderMCs(moduleCredits) {
  return `${moduleCredits}${NBSP}${moduleCredits === 1 ? 'MC' : 'MCs'}`;
}

class TimetableModulesTable extends Component<Props, State> {
  state = {
    moduleOrder: 'exam',
  };

  totalMCs() {
    return sum(this.props.modules.map((module) => parseInt(module.ModuleCredit, 10)));
  }

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
    const modules = sortBy(this.props.modules, (module) =>
      moduleOrders[this.state.moduleOrder].orderBy(module, semester),
    );

    return (
      <Fragment>
        <div className={classnames(styles.modulesTable, 'row')}>
          {modules.map((module) => (
            <div
              className={classnames(styles.modulesTableRow, 'col-sm-6', {
                'col-lg-4': horizontalOrientation,
                'col-md-12': !horizontalOrientation,
              })}
              key={module.ModuleCode}
            >
              <div className={styles.moduleColor}>
                <ColorPicker
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
                  &nbsp;&middot;&nbsp;{renderMCs(module.ModuleCredit)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={classnames(styles.footer, 'row align-items-center')}>
          <div className="col-12">
            <hr />
          </div>
          <div className="col">
            Total Module Credits: <strong>{renderMCs(this.totalMCs())}</strong>
          </div>
          <div className={classnames(styles.moduleOrder, 'col')}>
            <label htmlFor="moduleOrder">Order</label>
            <select
              onChange={(evt) => this.setState({ moduleOrder: evt.target.value })}
              className={classnames(styles.moduleOrder, 'form-control form-control-sm')}
              value={this.state.moduleOrder}
              id="moduleOrder"
            >
              {map(moduleOrders, ({ label }, key) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(null, {
  selectModuleColor,
  hideLessonInTimetable,
  showLessonInTimetable,
})(TimetableModulesTable);
