import React, { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  ReactiveBase,
  DataSearch,
  ReactiveList,
  SelectedFilters,
  MultiList,
  MultiDataList,
  MultiDropdownList,
  MultiRange,
  ToggleButton,
} from '@appbaseio/reactivesearch';
import axios from 'axios';
import produce from 'immer';
import { map } from 'lodash';

import { ModuleInformation, attributeDescription } from 'types/modules';
import { AnyGroup, FacultyDepartments, FilterGroups, PageRange, PageRangeDiff } from 'types/views';

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
import {
  defaultGroups,
  DEPARTMENT,
  EXAMS,
  FACULTY,
  LEVELS,
  MODULE_CREDITS,
  SEMESTER,
  serializeGroups,
  updateGroups,
  ATTRIBUTES,
} from 'utils/moduleFilters';
import { createSearchFilter, SEARCH_QUERY_KEY, sortModules } from 'utils/moduleSearch';
import nusmods from 'apis/nusmods';
import { resetModuleFinder } from 'actions/moduleFinder';
import FilterGroup from 'utils/filters/FilterGroup';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { defer } from 'utils/react';
import { breakpointUp, queryMatch } from 'utils/css';
import { captureException } from 'utils/error';
import { State as StoreState } from 'types/state';
import styles from './ModuleFinderContainer.scss';

export type Props = {
  searchTerm: string;
  resetModuleFinder: () => unknown;
} & RouteComponentProps;

export type State = {
  // loading: boolean;
  // page: PageRange;
  // modules: ModuleInformation[];
  // filterGroups: FilterGroups;
  // isMenuOpen: boolean;
  // error: Error | null;
};

const pageHead = <Title>Modules</Title>;

function ModuleFinderContainerComponent<Props, State>() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <div className="modules-page-container page-container">
      {pageHead}
      <ReactiveBase app="modules" url="http://localhost:9200">
        <div className="row">
          <div className="col">
            <h1 className="sr-only">Module Finder</h1>

            <DataSearch
              componentId="GeneralSearchBox"
              autosuggest={false}
              debounce={1000}
              showFilter={false}
              placeholder="Module code, names and descriptions"
              dataField={['moduleCode', 'title', 'description']}
            />

            <ul className="modules-list">
              <ReactiveList
                componentId="SearchResult"
                dataField="moduleCode"
                pagination
                react={{
                  and: [
                    'GeneralSearchBox',
                    'SemFilter',
                    'LevelFilter',
                    'MCFilter',
                    'FacultyFilter',
                    'DepartmentFilter',
                    'AttributeFilter',
                  ],
                }}
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
                  componentId="SemFilter"
                  dataField="semesterData.semester"
                  title="Available In"
                  filterLabel="Available In"
                  data={map(config.semesterNames, (semName, semNumStr) => ({
                    label: semName,
                    value: semNumStr,
                  }))}
                  queryFormat="or"
                  showCheckbox
                  showCount
                  showSearch={false}
                />
                <MultiList
                  componentId="LevelFilter"
                  dataField="moduleCode.level"
                  title="Level"
                  filterLabel="Level"
                  sortBy="asc"
                  showSearch={false}
                />
                <MultiRange
                  componentId="MCFilter"
                  dataField="moduleCredit"
                  title="Module Credit"
                  filterLabel="MCs"
                  react={{
                    and: ['GeneralSearchBox', 'FacultyFilter', 'DepartmentFilter'],
                  }}
                  data={[
                    { start: 0, end: 3, label: '0-3 MC' },
                    { start: 4, end: 4, label: '4 MC' },
                    { start: 5, end: 8, label: '5-8 MC' },
                    { start: 8, end: 300, label: 'More than 8 MC' },
                  ]}
                />
                <MultiDropdownList
                  componentId="FacultyFilter"
                  dataField="faculty.keyword"
                  title="Faculty"
                  filterLabel="Faculty"
                  queryFormat="or"
                  showCheckbox
                  react={{
                    and: ['MCFilter'],
                  }}
                />
                <MultiDropdownList
                  componentId="DepartmentFilter"
                  dataField="department.keyword"
                  title="Department"
                  filterLabel="Department"
                  queryFormat="or"
                  showCheckbox
                  react={{
                    and: ['MCFilter'],
                  }}
                />
                <MultiDataList
                  componentId="AttributeFilter"
                  dataField="attributes"
                  title="Other attributes"
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
}

const mapStateToProps = (state: StoreState) => ({
  searchTerm: state.moduleFinder.search.term,
});

// Explicitly naming the components to make HMR work
const ModuleFinderContainerWithRouter = withRouter(ModuleFinderContainerComponent);
const ModuleFinderContainer = connect(
  mapStateToProps,
  { resetModuleFinder },
)(ModuleFinderContainerWithRouter);
export default ModuleFinderContainer;
