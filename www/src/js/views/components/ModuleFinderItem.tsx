import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { ModuleInformation } from 'types/modules';
import { ModuleSearch } from 'types/reducers';
import { State } from 'reducers';

import { modulePage } from 'views/routes/paths';
import { BULLET, highlight } from 'utils/react';
import { intersperse } from 'utils/array';
import ModuleSemesterInfo from './module-info/ModuleSemesterInfo';
import ModuleWorkload from './module-info/ModuleWorkload';
import LinkModuleCodes from './LinkModuleCodes';

type Props = {
  module: ModuleInformation;
  search: ModuleSearch;
};

export class ModuleFinderItemComponent extends React.PureComponent<Props> {
  highlight(content: string) {
    if (!this.props.search.term) return content;
    return highlight(content, this.props.search.tokens);
  }

  render() {
    const { module } = this.props;

    return (
      <li className="modules-item">
        <div className="row">
          <div className="col-lg-8 col-md-12 col-sm-8">
            <header>
              <h2 className="modules-title">
                <Link to={modulePage(module.ModuleCode, module.ModuleTitle)}>
                  {this.highlight(`${module.ModuleCode} ${module.ModuleTitle}`)}
                </Link>
              </h2>
              <p>
                {intersperse(
                  [
                    <span key="department">{module.Department}</span>,
                    <span key="mc">{module.ModuleCredit} MCs</span>,
                  ],
                  BULLET,
                )}
              </p>
            </header>
            {module.ModuleDescription && <p>{this.highlight(module.ModuleDescription)}</p>}
            <dl>
              {module.Preclusion && (
                <>
                  <dt>Preclusions</dt>
                  <dd>
                    <LinkModuleCodes>{module.Preclusion}</LinkModuleCodes>
                  </dd>
                </>
              )}

              {module.Prerequisite && (
                <>
                  <dt>Prerequisite</dt>
                  <dd>
                    <LinkModuleCodes>{module.Prerequisite}</LinkModuleCodes>
                  </dd>
                </>
              )}

              {module.Corequisite && (
                <>
                  <dt>Corequisite</dt>
                  <dd>
                    <LinkModuleCodes>{module.Corequisite}</LinkModuleCodes>
                  </dd>
                </>
              )}
            </dl>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-4">
            <ModuleSemesterInfo semesters={module.SemesterData} moduleCode={module.ModuleCode} />
            {module.Workload && <ModuleWorkload workload={module.Workload} />}
          </div>
        </div>
      </li>
    );
  }
}

export default connect((state: State) => ({
  search: state.moduleFinder.search,
}))(ModuleFinderItemComponent);
