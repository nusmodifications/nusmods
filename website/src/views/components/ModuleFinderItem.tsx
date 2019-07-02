import React from 'react';
import { Link } from 'react-router-dom';

import { ModuleInformation } from 'types/modules';
import { ElasticSearchResult } from 'types/vendor/elastic-search';

import { modulePage } from 'views/routes/paths';
import { BULLET } from 'utils/react';
import { intersperse } from 'utils/array';
import ModuleSemesterInfo from './module-info/ModuleSemesterInfo';
import ModuleWorkload from './module-info/ModuleWorkload';
import LinkModuleCodes from './LinkModuleCodes';
import styles from './ModuleFinderItem.scss';
import { mergeModuleHighlight } from '../../utils/elasticSearch';

type Props = {
  module: ModuleInformation;
  highlight: ElasticSearchResult<ModuleInformation>['highlight'];
};

// We're setting HTML directly because ElasticSearch returns highlights directly as strings
/* eslint-disable react/no-danger */

const ModuleFinderItem: React.FC<Props> = ({ module, highlight = {} }) => {
  return (
    <li className={styles.modulesItem}>
      <div className="row">
        <div className="col-lg-8 col-md-12 col-sm-8">
          <header>
            <h2 className={styles.modulesTitle}>
              <Link to={modulePage(module.moduleCode, module.title)}>
                <span
                  dangerouslySetInnerHTML={mergeModuleHighlight(
                    module.moduleCode,
                    highlight.moduleCode,
                  )}
                />{' '}
                <span
                  dangerouslySetInnerHTML={mergeModuleHighlight(module.title, highlight.title)}
                />
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
          {module.description && (
            <p
              dangerouslySetInnerHTML={mergeModuleHighlight(
                module.description,
                highlight.description,
              )}
            />
          )}
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
};

export default ModuleFinderItem;
