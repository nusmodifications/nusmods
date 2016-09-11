import React, { PropTypes } from 'react';
import _ from 'lodash';

const TimetableModulesTable = (props) => {
  return (
    <table className="table table-bordered">
      <tbody>
        {_.map(props.modules, (module) => {
          return (
            <tr key={module.ModuleCode}>
              <td>{module.ModuleCode}</td>
              <td>{module.ModuleTitle}</td>
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
  modules: PropTypes.array,
};

export default TimetableModulesTable;
