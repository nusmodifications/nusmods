import React, { useState } from 'react';
import {
  ReactiveBase,
  ReactiveList,
  SelectedFilters,
  MultiList,
  MultiDataList,
  MultiDropdownList,
  MultiRange,
} from '@appbaseio/reactivesearch';
import { map } from 'lodash';

import { attributeDescription } from 'types/modules';

import ModuleFinderItem from 'views/components/ModuleFinderItem';
import ModuleFinderList from 'views/modules/ModuleFinderList';
import ModuleSearchBox from 'views/modules/ModuleSearchBox';
import ChecklistFilters from 'views/components/filters/ChecklistFilters';
import DropdownListFilters from 'views/components/filters/DropdownListFilters';
import ApiError from 'views/errors/ApiError';
import Warning from 'views/errors/Warning';
import LoadingSpinner from 'views/components/LoadingSpinner';
import SideMenu, { OPEN_MENU_LABEL } from 'views/components/SideMenu';
import { Filter } from 'views/components/icons';
import Title from 'views/components/Title';
import Omelette, { matchEgg } from 'views/components/Omelette';

import config from 'config';
import { forceInstantSearch } from 'utils/debug';
import { captureException } from 'utils/error';
import styles from './ModuleFinderContainer.scss';

export type Props = {};

const pageHead = <Title>Modules</Title>;

const reactiveBaseResetTheme = {
  typography: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
};

const ModuleFinderContainer: React.FunctionComponent<Props> = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <div className="modules-page-container page-container">
      {pageHead}
      <ReactiveBase
        className={styles.reactiveBase}
        app="modules"
        url="http://localhost:9200"
        theme={reactiveBaseResetTheme}
      >
        <div className="row">
          <div className="col">
            <h1 className="sr-only">Module Finder</h1>

            <ModuleSearchBox
              componentId="q"
              showFilter={false}
              URLParams
              dataField={['moduleCode^10', 'title^3', 'description']}
            />

            <ul className="modules-list">
              <ReactiveList
                componentId="page"
                dataField="moduleCode"
                pagination
                URLParams
                react={{
                  and: ['q', 'sem', 'level', 'mcs', 'faculty', 'department', 'attrs'],
                }}
                innerClass={{
                  pagination: styles.pagination,
                }}
                loader={<LoadingSpinner />}
                renderItem={(res) => <ModuleFinderItem key={res.moduleCode} module={res} />}
                renderResultStats={(res) => {
                  let { numberOfResults } = res;
                  // numberOfResults is an object instead of a number in Elasticsearch 7.
                  // See: https://github.com/appbaseio/reactivesearch/issues/948#issuecomment-488661618
                  if (!Number.isInteger(numberOfResults)) {
                    numberOfResults = numberOfResults.value;
                  }
                  return <div className="module-page-divider">{numberOfResults} modules found</div>;
                }}
                renderNoResults={() => <Warning message="No modules found" />}
              />
            </ul>
          </div>

          <div className="col-md-4 col-lg-3">
            <SideMenu
              isOpen={isMenuOpen}
              toggleMenu={() => setMenuOpen(!isMenuOpen)}
              openIcon={<Filter aria-label={OPEN_MENU_LABEL} />}
            >
              <div className={styles.moduleFilters}>
                <header className={styles.filterHeader}>
                  <h3>Refine by</h3>
                </header>

                <SelectedFilters showClearAll clearAllLabel="Clear filters" />

                <MultiDataList
                  componentId="sem"
                  dataField="semesterData.semester"
                  title="Offered In"
                  filterLabel="Offered In"
                  URLParams
                  data={map(config.semesterNames, (semName, semNumStr) => ({
                    label: semName,
                    value: semNumStr,
                  }))}
                  defaultValue={Object.values(config.semesterNames)}
                  react={{
                    and: ['q', 'level', 'mcs', 'faculty', 'department', 'attrs'],
                  }}
                  showCount
                  showSearch={false}
                />
                <MultiList
                  componentId="level"
                  dataField="moduleCode.level"
                  title="Level"
                  filterLabel="Level"
                  sortBy="asc"
                  showSearch={false}
                  URLParams
                  react={{
                    and: ['q', 'sem', 'mcs', 'faculty', 'department', 'attrs'],
                  }}
                />
                <MultiRange
                  componentId="mcs"
                  dataField="moduleCredit"
                  title="Module Credit"
                  filterLabel="MCs"
                  URLParams
                  data={[
                    { start: 0, end: 3, label: '0-3 MC' },
                    { start: 4, end: 4, label: '4 MC' },
                    { start: 5, end: 8, label: '5-8 MC' },
                    { start: 8, end: 300, label: 'More than 8 MC' },
                  ]}
                  react={{
                    and: ['q', 'sem', 'level', 'faculty', 'department', 'attrs'],
                  }}
                />
                <MultiDropdownList
                  componentId="faculty"
                  dataField="faculty.keyword"
                  title="Faculty"
                  filterLabel="Faculty"
                  queryFormat="or"
                  showCheckbox
                  URLParams
                  react={{
                    and: ['q', 'sem', 'level', 'mcs', 'department', 'attrs'],
                  }}
                />
                <MultiDropdownList
                  componentId="department"
                  dataField="department.keyword"
                  title="Department"
                  filterLabel="Department"
                  queryFormat="or"
                  showCheckbox
                  URLParams
                  react={{
                    and: ['q', 'sem', 'level', 'mcs', 'faculty', 'attrs'],
                  }}
                />
                <MultiDataList
                  componentId="attrs"
                  dataField="attributes"
                  title="Other attributes"
                  URLParams
                  data={['su', 'grsu', 'ssgf', 'sfs', 'lab', 'ism'].map((attr) => ({
                    label: attributeDescription[attr] || attr,
                    value: attr,
                  }))}
                  multiSelect
                  showSearch={false}
                  customQuery={(values) => {
                    if (!Array.isArray(values) || values.length === 0) return null;
                    const should = values.map((v) => ({ match: { [`attributes.${v}`]: true } }));
                    return { query: { bool: { should } } };
                  }}
                />
              </div>
            </SideMenu>
          </div>
        </div>
      </ReactiveBase>
    </div>
  );
};

export default ModuleFinderContainer;
