import * as React from 'react';
import classnames from 'classnames';
import { map, sumBy } from 'lodash';
import { connect } from 'react-redux';

import { State } from 'reducers';
import { ModuleTableOrder } from 'types/views';
import { Module, Semester } from 'types/modules';
import { setModuleTableOrder } from 'actions/settings';
import { getExamDate, renderMCs } from 'utils/modules';
import styles from './TimetableModulesTable.scss';

type ModuleOrder = {
  label: string;
  orderBy: (module: Module, semester: Semester) => string | number;
};

export const moduleOrders: { [moduleTableOrder: string]: ModuleOrder } = {
  exam: {
    label: 'Exam Date',
    orderBy: (module: Module, semester: Semester) => getExamDate(module, semester) || '',
  },
  mc: { label: 'Module Credits', orderBy: (module: Module) => module.moduleCredit },
  code: { label: 'Module Code', orderBy: (module: Module) => module.moduleCode },
};

type Props = {
  moduleTableOrder: ModuleTableOrder;
  modules: Module[];

  setModuleTableOrder: (moduleTableOrder: ModuleTableOrder) => void;
};

function ModulesTableFooter(props: Props) {
  const totalMCs = sumBy(props.modules, (module) => parseInt(module.moduleCredit, 10));

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
          onChange={(evt) => props.setModuleTableOrder(evt.target.value as ModuleTableOrder)}
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
  (state: State) => ({ moduleTableOrder: state.settings.moduleTableOrder }),
  {
    setModuleTableOrder,
  },
)(ModulesTableFooter);
