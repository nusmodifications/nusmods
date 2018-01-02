// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import type { ModuleWithColor, Semester } from 'types/modules';

import { selectModuleColor } from 'actions/theme';
import makeResponsive from 'views/hocs/makeResponsive';
import { breakpointUp } from 'utils/css';
import { hideLessonsInTimetable, showLessonsInTimetable } from 'actions/settings';
import { getFormattedModuleExamDate } from 'utils/modules';
import ModulesTableRow from 'views/timetable/ModulesTableRow';

import styles from './ModulesTable.scss';

type Props = {
  selectModuleColor: Function,
  hideLessonsInTimetable: Function,
  showLessonsInTimetable: Function,
  semester: Semester,
  modules: Array<ModuleWithColor>,
  onRemoveModule: Function,
  horizontalOrientation: boolean,
  matchBreakpoint: boolean,
  readOnly: boolean,
};

class ModulesTable extends PureComponent<Props> {
  render() {
    const { modules, matchBreakpoint, horizontalOrientation } = this.props;
    if (!modules.length) {
      return null;
    }
    return (
      <table
        className={classnames({
          [styles.table]: horizontalOrientation && matchBreakpoint,
          cards: !(horizontalOrientation && matchBreakpoint),
        })}
      >
        <thead className={styles.thead}>
          <tr className={styles.tableHeaderRow}>
            <th />
            <th>Title</th>
            <th className="text-right">
              <abbr title="Module Credits">MCs</abbr>
            </th>
            <th>Exam Timing</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => (
            <ModulesTableRow
              key={module.ModuleCode}
              module={module}
              exam={getFormattedModuleExamDate(module, this.props.semester)}
              onSelectModuleColor={this.props.selectModuleColor}
              onHideModule={this.props.hideLessonsInTimetable}
              onShowModule={this.props.showLessonsInTimetable}
              onRemoveModule={this.props.onRemoveModule}
              readOnly={this.props.readOnly}
            />
          ))}
          <tr className={styles.tableSummary}>
            <td colSpan="2" className={styles.tableSummaryText}>
              Total Module Credits for Semester
            </td>
            <td className="text-right">
              {modules.reduce((sum, module) => sum + parseInt(module.ModuleCredit, 10), 0)}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

const responsiveModulesTable = makeResponsive(ModulesTable, breakpointUp('md'));
export default connect(null, {
  selectModuleColor,
  hideLessonsInTimetable,
  showLessonsInTimetable,
})(responsiveModulesTable);
