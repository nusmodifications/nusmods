import React from 'react';
import { Link } from 'react-router-dom';

import { ModuleInformation } from 'types/modules';

import { modulePage } from 'views/routes/paths';
import { BULLET } from 'utils/react';
import { intersperse } from 'utils/array';
import ModuleSemesterInfo from './module-info/ModuleSemesterInfo';
import ModuleWorkload from './module-info/ModuleWorkload';
import LinkModuleCodes from './LinkModuleCodes';
import styles from './ModuleFinderItem.scss';

type Props = {
  module: ModuleInformation;
};

// We're setting HTML directly because ElasticSearch returns highlights directly as strings
/* eslint-disable react/no-danger */

const ModuleFinderItem: React.FC<Props> = ({ module }) => {
  return (
    <li className={styles.modulesItem}>
      <div className="row">
        <div className="col-lg-8 col-md-12 col-sm-8">
          <header>
            <h2 className={styles.modulesTitle}>
              <Link
                to={modulePage(module.moduleCode, module.title)}
                dangerouslySetInnerHTML={{ __html: `${module.moduleCode} ${module.title}` }}
              />
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
          {module.description && <p dangerouslySetInnerHTML={{ __html: module.description }} />}
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
