// @flow
import type { ModuleWithColor } from 'types/modules';

import React from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';

import { getModuleSemExamDate, modulePagePath } from 'utils/modules';

type Props = {
  semester: number,
  modules: Array<ModuleWithColor>,
  onRemoveModule: Function,
  horizontalOrientation: boolean,
};

function TimetableModulesTable(props: Props) {
  return (
    <div className="modules-table row">
      {props.modules.length ?
        props.modules.map((module) => {
          return (
            <div className={classnames('modules-table-row', {
              'col-md-4': props.horizontalOrientation,
              'col-md-12': !props.horizontalOrientation,
            })}
              key={module.ModuleCode}
            >
              <div className="modules-table-row-inner">
                <div className="color-column">
                  <div className={`modules-table-color color-${module.colorIndex}`}/>
                </div>
                <div className="module-details-column">
                  <Link to={modulePagePath(module.ModuleCode)}>
                    {module.ModuleCode} {module.ModuleTitle}
                  </Link>
                  <div>
                    <small>
                      Exam: {getModuleSemExamDate(module, props.semester)}
                      &nbsp;&middot;&nbsp;
                      {module.ModuleCredit} MCs
                      &nbsp;&middot;&nbsp;
                      <span className="btn-remove" onClick={() => {
                        props.onRemoveModule(module.ModuleCode);
                      }}>
                        Remove
                      </span>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          );
        })
        : <p className="text-sm-center">No modules added.</p>
      }
    </div>
  );
}

export default TimetableModulesTable;
