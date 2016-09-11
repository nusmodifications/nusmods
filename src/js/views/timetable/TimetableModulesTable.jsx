import React, { PropTypes } from 'react';
import _ from 'lodash';

import { getModuleHistory } from 'utils/modules';

const TimetableModulesTable = (props) => {
  return (
    <table className="table table-bordered">
      <tbody>
        {_.map(props.modules, (module) => {
          return (
            <tr key={module.ModuleCode}>
              <td>{module.ModuleCode}</td>
              <td>{module.ModuleTitle}</td>
              <td>{module.ModuleCredit}</td>
              <td>{_.get(getModuleHistory(module, props.semester), 'ExamDate', '-')}</td>
              <td>
                <button className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    props.onRemoveModule(module.ModuleCode);
                  }}
                >
                  ✖
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

TimetableModulesTable.propTypes = {
  semester: PropTypes.number,
  modules: PropTypes.array,
};

export default TimetableModulesTable;
