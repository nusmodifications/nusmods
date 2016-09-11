import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import _ from 'lodash';

import { getExamTime } from 'utils/modules';

const TimetableModulesTable = (props) => {
  return (
    <table className="table table-bordered">
      <tbody>
        {_.map(props.modules, (module) => {
          return (
            <tr key={module.ModuleCode}>
              <td>
                <Link to={`/modules/${module.ModuleCode}`}>
                  {module.ModuleCode} {module.ModuleTitle}
                </Link>
              </td>
              <td>{module.ModuleCredit}</td>
              <td>{getExamTime(module, props.semester)}</td>
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
