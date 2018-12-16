// @flow

import type { ModuleTableOrder } from 'types/views';
import type { ModuleWithColor, Semester } from 'types/modules';
import React from 'react';
import classnames from 'classnames';
import { map, sumBy } from 'lodash';
import { connect } from 'react-redux';

import { setModuleTableOrder } from 'actions/settings';
import { getModuleExamDate, renderMCs } from 'utils/modules';
import styles from './TimetableModulesTable.scss';

type ModuleOrder = {
  label: string,
  orderBy: (ModuleWithColor, Semester) => string | number,
};

export const moduleOrders: { [ModuleTableOrder]: ModuleOrder } = {
  exam: { label: 'Exam Date', orderBy: (module, semester) => getModuleExamDate(module, semester) },
  mc: { label: 'Module Credits', orderBy: (module) => module.ModuleCredit },
  code: { label: 'Module Code', orderBy: (module) => module.ModuleCode },
};

type Props = {|
  moduleTableOrder: ModuleTableOrder,
  modules: ModuleWithColor[],

  setModuleTableOrder: (ModuleTableOrder) => void,
|};

function ModulesTableFooter(props: Props) {
  const totalMCs = sumBy(props.modules, (module) => parseInt(module.ModuleCredit, 10));

  return (
    <div className={classnames(styles.footer, 'row align-items-center')}>
      <div className="col-12">
        <hr />
      </div>
      <div className="col">
        Total Module Credits: <strong>{renderMCs(totalMCs)}</strong>
      </div>
      <div className={classnames(styles.moduleOrder, 'col no-export')}>
        <label htmlFor="moduleOrder">Order</label>
        <select
          onChange={(evt) => props.setModuleTableOrder(evt.target.value)}
          className={classnames(styles.moduleOrder, 'form-control form-control-sm')}
          value={props.moduleTableOrder}
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
  );
}

export default connect(
  (state) => ({ moduleTableOrder: state.settings.moduleTableOrder }),
  {
    setModuleTableOrder,
  },
)(ModulesTableFooter);
