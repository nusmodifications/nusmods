// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { partial } from 'lodash';

import type { ModuleCode, ModuleWithColor, Semester } from 'types/modules';
import type { ColorIndex } from 'types/reducers';

import makeResponsive from 'views/hocs/makeResponsive';
import { breakpointUp } from 'utils/css';
import {
  selectModuleColor,
  hideLessonInTimetable,
  showLessonInTimetable,
} from 'actions/timetables';
import { getFormattedModuleExamDate } from 'utils/modules';
import ModulesTableRow from 'views/timetable/ModulesTableRow';

import styles from './ModulesTable.scss';

type Props = {
  semester: Semester,
  modules: Array<ModuleWithColor>,
  onRemoveModule: Function,
  horizontalOrientation: boolean,
  matchBreakpoint: boolean,
  readOnly: boolean,

  // Actions
  selectModuleColor: (Semester, ModuleCode, ColorIndex) => void,
  hideLessonInTimetable: (Semester, ModuleCode) => void,
  showLessonInTimetable: (Semester, ModuleCode) => void,
};

class ModulesTable extends PureComponent<Props> {
  render() {
    const { semester, modules, matchBreakpoint, horizontalOrientation } = this.props;
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
              onSelectModuleColor={partial(this.props.selectModuleColor, semester)}
              onHideModule={partial(this.props.hideLessonInTimetable, semester)}
              onShowModule={partial(this.props.showLessonInTimetable, semester)}
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
  hideLessonInTimetable,
  showLessonInTimetable,
})(responsiveModulesTable);
