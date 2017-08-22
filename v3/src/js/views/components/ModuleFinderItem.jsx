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
      <div className="row">
        <div className="col-lg-8 col-md-12 col-sm-8">
          <header>
            <h2 className="modules-title">
              <Link to={modulePagePath(module.ModuleCode)}>
                {module.ModuleCode} {module.ModuleTitle}
              </Link>
            </h2>
          </header>

          <p>{ module.ModuleDescription }</p>

          <dl>
            { module.Preclusion && ([
              <dt key="preclusions-dt">Preclusions</dt>,
              <dd key="preclusions-dd">{module.Preclusion}</dd>,
            ])}

            { module.Prerequisite && ([
              <dt key="prerequisite-dt">Prerequisite</dt>,
              <dd key="prerequisite-dd">{module.Prerequisite}</dd>,
            ])}

            { module.Corequisite && ([
              <dt key="corequisite-dt">Corequisite</dt>,
              <dd key="corequisite-dd">{module.Corequisite}</dd>,
            ])}
          </dl>

        </div>

        <div className="col-lg-4 col-md-12 col-sm-4">
          <ModuleSemesterInfo semesters={module.History} />
          {module.Workload &&
            <ModuleWorkload workload={module.Workload} />
          }
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
