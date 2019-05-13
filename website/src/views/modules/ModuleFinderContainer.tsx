import React, { useState } from 'react';
import {
  SearchkitManager,
  SearchkitProvider,
  SearchBox,
  RefinementListFilter,
  Hits,
  HitsStats,
  HitItemProps,
  SearchkitComponent,
  SelectedFilters,
  MenuFilter,
  HierarchicalMenuFilter,
  Pagination,
  ResetFilters,
} from 'searchkit';
import axios from 'axios';
import produce from 'immer';
import { each, mapValues, values } from 'lodash';

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

const searchkit = new SearchkitManager('http://localhost:9200/modules');

const pageHead = <Title>Modules</Title>;

function HitModuleItem(props: HitItemProps) {
  const { result } = props;
  console.log('kon', result);
  const { _source: source } = result;
  return <ModuleFinderItem key={source.moduleCode} module={source} />;
}

const ModuleFinderContainer: React.FunctionComponent<Props> = () => {
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
              queryFields={['moduleCode', 'title', 'description']}
              placeholder="Module code, names and descriptions"
            />

            <ul className="modules-list">
              <Hits hitsPerPage={5} itemComponent={HitModuleItem} />
            </ul>
            <Pagination showNumbers showLast />
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
              </div>
            </SideMenu>
          </div>
        </div>
      </SearchkitProvider>
    </div>
  );
};

export default ModuleFinderContainer;
