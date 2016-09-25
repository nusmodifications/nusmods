// @flow

import React from 'react';
import { Link } from 'react-router';

import { getModuleSemExamDate, modulePagePath } from 'utils/modules';
import type { Module } from 'types/modules';

type Props = {
  semester: number,
  modules: Array<Module>,
  onRemoveModule: Function,
};

function TimetableModulesTable(props: Props) {
  return (
    <div className="modules-table">
      {props.modules.length ?
        props.modules.map((module) => {
          return (
            <div className="modules-table-row row" key={module.ModuleCode}>
              <div className="col-md-12">
                <Link to={modulePagePath(module.ModuleCode)}>
                  {module.ModuleCode} {module.ModuleTitle}
                </Link>
              </div>
              <div className="col-md-12">
                <small>
                  {module.ModuleCredit} MCs&nbsp;&middot;&nbsp;
                  {getModuleSemExamDate(module, props.semester)}
                  &nbsp;&middot;&nbsp;
                  <span className="btn-remove text-muted" onClick={() => {
                    props.onRemoveModule(module.ModuleCode);
                  }}>
                    Remove
                  </span>
                </small>
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
