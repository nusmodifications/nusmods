// @flow
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import type { Module } from 'types/modules';

import { modulePagePath } from 'utils/modules';
import ModuleSemesterInfo from './module-info/ModuleSemesterInfo';
import ModuleWorkload from './module-info/ModuleWorkload';
import LinkModuleCodes from './LinkModuleCodes';

type Props = {
  module: Module,
};

export default class ModuleFinderItem extends PureComponent<Props> {
  render() {
    const { module } = this.props;

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
              <p>
                <a>{module.Department}</a> &middot;&nbsp;
                <a>{module.ModuleCredit} MCs</a>
              </p>
            </header>
            {module.ModuleDescription && <p>{module.ModuleDescription}</p>}
            <dl>
              {module.Preclusion && ([
                <dt key="preclusions-dt">Preclusions</dt>,
                <dd key="preclusions-dd">
                  <LinkModuleCodes>{module.Preclusion}</LinkModuleCodes>
                </dd>,
              ])}

              {module.Prerequisite && ([
                <dt key="prerequisite-dt">Prerequisite</dt>,
                <dd key="prerequisite-dd">
                  <LinkModuleCodes>{module.Prerequisite}</LinkModuleCodes>
                </dd>,
              ])}

              {module.Corequisite && ([
                <dt key="corequisite-dt">Corequisite</dt>,
                <dd key="corequisite-dd">
                  <LinkModuleCodes>{module.Corequisite}</LinkModuleCodes>
                </dd>,
              ])}
            </dl>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-4">
            <ModuleSemesterInfo semesters={module.History} />
            {module.Workload && <ModuleWorkload workload={module.Workload} />}
          </div>
        </div>
      </li>
    );
  }
}
