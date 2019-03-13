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
                <Link to={modulePage(module.moduleCode, module.title)}>
                  {this.highlight(`${module.moduleCode} ${module.title}`)}
                </Link>
              </h2>
              <p>
                {intersperse(
                  [
                    <span key="department">{module.department}</span>,
                    <span key="mc">{module.moduleCredit} MCs</span>,
                  ],
                  BULLET,
                )}
              </p>
            </header>
            {module.description && <p>{this.highlight(module.description)}</p>}
            <dl>
              {module.preclusion && (
                <>
                  <dt>Preclusions</dt>
                  <dd>
                    <LinkModuleCodes>{module.preclusion}</LinkModuleCodes>
                  </dd>
                </>
              )}

              {module.prerequisite && (
                <>
                  <dt>Prerequisite</dt>
                  <dd>
                    <LinkModuleCodes>{module.prerequisite}</LinkModuleCodes>
                  </dd>
                </>
              )}

              {module.corequisite && (
                <>
                  <dt>Corequisite</dt>
                  <dd>
                    <LinkModuleCodes>{module.corequisite}</LinkModuleCodes>
                  </dd>
                </>
              )}
            </dl>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-4">
            <ModuleSemesterInfo semesters={module.semesterData} moduleCode={module.moduleCode} />
            {module.workload && <ModuleWorkload workload={module.workload} />}
          </div>
        </div>
      </li>
    );
  }
}

export default connect((state: State) => ({
  search: state.moduleFinder.search,
}))(ModuleFinderItemComponent);
