// @flow
import React from 'react';
import { Link } from 'react-router-dom';

import { modulePagePath } from 'utils/modules';
import type { Module } from 'types/modules';
import ModuleSemesterInfo from './module-info/ModuleSemesterInfo';

type Props = {
  module: Module,
};

export default function ModuleFinderItem(props: Props) {
  const { module } = props;

  return (
    <li className="modules-item">
      <header>
        <h2 className="modules-title">
          <Link to={modulePagePath(module.ModuleCode)}>
            {module.ModuleCode} {module.ModuleTitle}
          </Link>
        </h2>
      </header>
      <div className="row">
        <div className="col-sm-8">
          <p>{ module.ModuleDescription }</p>
        </div>
        <div className="col-sm-4">
          <ModuleSemesterInfo semesters={module.History} />
        </div>
      </div>

      <footer>
        <p>
          <a>{ module.Department }</a> &middot;&nbsp;
          <a>{ module.ModuleCredit } MC</a>
        </p>
      </footer>
    </li>
  );
}
