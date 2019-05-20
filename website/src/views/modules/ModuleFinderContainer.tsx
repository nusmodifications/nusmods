import React, { useState } from 'react';
import {
  Hits,
  HitsStats,
  HitsStatsDisplayProps,
  InitialLoader,
  NoHits,
  NumericRefinementListFilter,
  Pagination,
  RefinementListFilter,
  ResetFilters,
  SearchkitManager,
  SearchkitProvider,
} from 'searchkit';
import classnames from 'classnames';

// TODO: Needed when implementing attribute filter
// import { attributeDescription } from 'types/modules';

import { ModuleFinderHitModuleItem } from 'views/components/ModuleFinderItem';
import ModuleSearchBox from 'views/modules/ModuleSearchBox';
import FilterContainer from 'views/components/filters/FilterContainer';
import CheckboxItem from 'views/components/filters/CheckboxItem';
import DropdownListFilters from 'views/components/filters/DropdownListFilters';
import ModuleFinderNoHits from 'views/errors/ModuleFinderNoHits';
import ModuleFinderApiError from 'views/errors/ModuleFinderApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';
import SideMenu, { OPEN_MENU_LABEL } from 'views/components/SideMenu';
import { Filter } from 'views/components/icons';
import Title from 'views/components/Title';

import config from 'config';
import { forceInstantSearch } from 'utils/debug';
import styles from './ModuleFinderContainer.scss';

export type Props = {};

const searchkit = new SearchkitManager('http://localhost:9200/modules');

const pageHead = <Title>Modules</Title>;

const ModuleFinderSidebarContents = () => {
  return (
    <div className={styles.moduleFilters}>
      <header className={styles.filterHeader}>
        <h3>Refine by</h3>
        <ResetFilters
          className="button"
          options={{ filter: true }}
          component={({ hasFilters, resetFilters }) =>
            hasFilters && (
              <button className="btn btn-link btn-sm" type="button" onClick={resetFilters}>
                Clear Filters
              </button>
            )
          }
        />
      </header>

      <RefinementListFilter
        id="sem"
        title="Offered In"
        field="semesterData.semester"
        operator="OR"
        orderKey="_term"
        orderDirection="asc"
        bucketsTransform={(a) => {
          return a.map(({ key, ...rest }) => ({
            key,
            ...rest,
            label: config.semesterNames[key],
          }));
        }}
        containerComponent={FilterContainer}
        itemComponent={CheckboxItem}
      />

      <RefinementListFilter
        id="level"
        title="Level"
        field="moduleCode.level"
        operator="OR"
        orderKey="_term"
        orderDirection="asc"
        containerComponent={FilterContainer}
        itemComponent={CheckboxItem}
      />

      <NumericRefinementListFilter
        id="mcs"
        title="MCs"
        field="moduleCredit"
        multiselect
        options={[
          { title: '0-3 MC', to: 4 },
          { title: '4 MC', from: 4, to: 5 },
          { title: '5-8 MC', from: 5, to: 9 },
          { title: 'More than 8 MC', from: 9 },
        ]}
        containerComponent={FilterContainer}
        itemComponent={CheckboxItem}
      />

      <RefinementListFilter
        id="fac"
        title="Faculty"
        field="faculty.keyword"
        operator="OR"
        size={500}
        containerComponent={FilterContainer}
        itemComponent={CheckboxItem}
        listComponent={DropdownListFilters}
        translations={{ placeholder: 'Add faculties filter...' }}
      />

      <RefinementListFilter
        id="dept"
        title="Department"
        field="department.keyword"
        operator="OR"
        size={500}
        containerComponent={FilterContainer}
        itemComponent={CheckboxItem}
        listComponent={DropdownListFilters}
        translations={{ placeholder: 'Add departments filter...' }}
      />

      <RefinementListFilter
        id="attrs"
        title="Attributes"
        field="attributes"
        operator="OR"
        containerComponent={FilterContainer}
        itemComponent={CheckboxItem}
      />
    </div>
  );
};

const ModuleFinderContainer = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <div className="modules-page-container page-container">
      {pageHead}
      <SearchkitProvider searchkit={searchkit}>
        <div className="row">
          <div className="col">
            <h1 className="sr-only">Module Finder</h1>

            <ModuleSearchBox id="q" />

            <ul className="modules-list">
              <HitsStats
                component={({ hitsCount }: HitsStatsDisplayProps) =>
                  hitsCount > 0 && (
                    <div className="module-page-divider">{hitsCount} modules found</div>
                  )
                }
              />
              <Hits hitsPerPage={5} itemComponent={ModuleFinderHitModuleItem} />
              <NoHits
                suggestionsField="title"
                component={ModuleFinderNoHits}
                errorComponent={ModuleFinderApiError}
              />
              <InitialLoader component={LoadingSpinner} />
            </ul>
            <Pagination
              showNumbers
              listComponent={({ items, selectedItems, toggleItem }) => {
                return (
                  <nav aria-label="Module search result pagination">
                    <ul className="pagination justify-content-center">
                      {items.map(({ key, label, page, disabled }) => (
                        <li
                          key={key}
                          className={classnames(
                            'page-item',
                            disabled ? 'disabled' : null,
                            selectedItems.includes(key) ? 'active' : null,
                          )}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => toggleItem(key)}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                );
              }}
            />
          </div>

          <div className="col-md-4 col-lg-3">
            <SideMenu
              isOpen={isMenuOpen}
              toggleMenu={() => setMenuOpen(!isMenuOpen)}
              openIcon={<Filter aria-label={OPEN_MENU_LABEL} />}
            >
              <ModuleFinderSidebarContents />
            </SideMenu>
          </div>
        </div>
      </SearchkitProvider>
    </div>
  );
};

export default ModuleFinderContainer;
