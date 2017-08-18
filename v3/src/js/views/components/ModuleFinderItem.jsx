// @flow
import React from 'react';
import { Link } from 'react-router-dom';

import { modulePagePath } from 'utils/modules';
import type { Module } from 'types/modules';
import ModuleSemesterInfo from './module-info/ModuleSemesterInfo';
import ModuleWorkload from './module-info/ModuleWorkload';

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
        <div className="col-lg-8 col-md-12 col-sm-8">
          <p>{ module.ModuleDescription }</p>
          <dl>
            { module.Preclusion && ([
              <dt>Preclusions</dt>,
              <dd>{module.Preclusion}</dd>,
            ]) }

            { module.Prerequisite && ([
              <dt>Prerequisite</dt>,
              <dd>{module.Prerequisite}</dd>,
            ]) }
          </dl>

        </div>

        <div className="col-lg-4 col-md-12 col-sm-4">
          <ModuleWorkload workload={module.Workload} />
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
