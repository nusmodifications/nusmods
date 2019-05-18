import React, { useState } from 'react';
import {
  CheckboxItemList,
  DynamicRangeFilter,
  HierarchicalMenuFilter,
  HitItemProps,
  Hits,
  HitsStats,
  ItemHistogramList,
  ItemProps,
  MenuFilter,
  MultiMatchQuery,
  NoHits,
  NumericRefinementListFilter,
  Pagination,
  RangeFilter,
  GroupedSelectedFilters,
  RefinementListFilter,
  ResetFilters,
  SearchBox,
  SearchkitComponent,
  SearchkitManager,
  SearchkitProvider,
  Select,
  Toggle,
} from 'searchkit';
import axios from 'axios';
import produce from 'immer';
import { each, mapValues, values } from 'lodash';
import classnames from 'classnames';

import { attributeDescription } from 'types/modules';

import ModuleFinderItem from 'views/components/ModuleFinderItem';
import ModuleFinderList from 'views/modules/ModuleFinderList';
import ModuleSearchBox from 'views/modules/ModuleSearchBox';
import FilterContainer from 'views/components/filters/FilterContainer';
import CheckboxItem from 'views/components/filters/CheckboxItem';
import DropdownListFilters from 'views/components/filters/SKDropdownListFilters';
import ApiError from 'views/errors/ApiError';
import Warning from 'views/errors/Warning';
import ModuleFinderNoHits from 'views/errors/ModuleFinderNoHits';
import LoadingSpinner from 'views/components/LoadingSpinner';
import SideMenu, { OPEN_MENU_LABEL } from 'views/components/SideMenu';
import { Filter } from 'views/components/icons';
import Title from 'views/components/Title';
import Omelette, { matchEgg } from 'views/components/Omelette';

import config from 'config';
import { forceInstantSearch } from 'utils/debug';
import { captureException } from 'utils/error';
import filterStyles from 'views/components/filters/styles.scss';
import styles from './ModuleFinderContainer.scss';

export type Props = {};

const searchkit = new SearchkitManager('http://localhost:9200/modules');

const pageHead = <Title>Modules</Title>;

function HitModuleItem(props: HitItemProps) {
  const { result } = props;
  const { _source: source } = result;
  return <ModuleFinderItem key={source.moduleCode} module={source} />;
}

const ModuleFinderContainer = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <div className="modules-page-container page-container">
      {pageHead}
      <SearchkitProvider searchkit={searchkit}>
        <div className="row">
          <div className="col">
            <h1 className="sr-only">Module Finder</h1>

            <SearchBox
              searchOnChange
              searchThrottleTime={300}
              queryFields={['moduleCode^10', 'title^3', 'description']}
              queryBuilder={(query: string, options: Record<string, any>) => ({
                bool: {
                  should: [
                    {
                      // eslint-disable-next-line @typescript-eslint/camelcase
                      multi_match: {
                        query,
                        ...options,
                        type: 'best_fields',
                        operator: 'or',
                        fuzziness: 'AUTO',
                      },
                    },
                    {
                      // eslint-disable-next-line @typescript-eslint/camelcase
                      multi_match: {
                        query,
                        ...options,
                        type: 'phrase_prefix',
                        operator: 'or',
                      },
                    },
                  ],
                  minimum_should_match: '1', // eslint-disable-line @typescript-eslint/camelcase
                },
              })}
              placeholder="Module code, names and descriptions"
            />

            <ul className="modules-list">
              <HitsStats
                component={({ hitsCount }) => (
                  <div className="module-page-divider">{hitsCount} modules found</div>
                )}
              />
              <Hits hitsPerPage={5} itemComponent={HitModuleItem} />
              <NoHits suggestionsField="title" component={ModuleFinderNoHits} />
            </ul>
            <Pagination
              showNumbers
              listComponent={({ items, selectedItems, toggleItem }) => {
                return (
                  <nav aria-label="Page navigation example">
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
              <div className={styles.moduleFilters}>
                <header className={styles.filterHeader}>
                  <h3>Refine by</h3>

                  <GroupedSelectedFilters />

                  <ResetFilters
                    className="button"
                    options={{ filter: true }}
                    component={({ hasFilters, resetFilters }) =>
                      hasFilters && (
                        <button
                          className="btn btn-link btn-sm"
                          type="button"
                          onClick={resetFilters}
                        >
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
                    { title: 'All' },
                    { title: '0-3 MC', from: 0, to: 3 },
                    { title: '4 MC', from: 4, to: 4 },
                    { title: '5-8 MC', from: 5, to: 8 },
                    { title: 'More than 8 MC', from: 8, to: 300 },
                  ]}
                  containerComponent={FilterContainer}
                  itemComponent={CheckboxItem}
                />

                <RefinementListFilter
                  id="fac"
                  title="Faculty"
                  field="faculty.keyword"
                  operator="OR"
                  containerComponent={FilterContainer}
                  itemComponent={CheckboxItem}
                  listComponent={DropdownListFilters}
                />

                <RefinementListFilter
                  id="dept"
                  title="Department"
                  field="department.keyword"
                  operator="OR"
                  containerComponent={FilterContainer}
                  itemComponent={CheckboxItem}
                  listComponent={DropdownListFilters}
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
            </SideMenu>
          </div>
        </div>
      </SearchkitProvider>
    </div>
  );
};

export default ModuleFinderContainer;
