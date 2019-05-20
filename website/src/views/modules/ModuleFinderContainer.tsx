import * as React from 'react';
import {
  Hits,
  HitsStats,
  HitsStatsDisplayProps,
  InitialLoader,
  NoHits,
  Pagination,
  SearchkitManager,
  SearchkitProvider,
} from 'searchkit';
import classnames from 'classnames';

import ModuleFinderSidebar from 'views/modules/ModuleFinderSidebar';
import ModuleSearchBox from 'views/modules/ModuleSearchBox';
import ModuleFinderNoHits from 'views/errors/ModuleFinderNoHits';
import ModuleFinderApiError from 'views/errors/ModuleFinderApiError';
import { ModuleFinderHitModuleItem } from 'views/components/ModuleFinderItem';
import LoadingSpinner from 'views/components/LoadingSpinner';
import Title from 'views/components/Title';

import { forceInstantSearch } from 'utils/debug';

export type Props = {};

const searchkit = new SearchkitManager('http://localhost:9200/modules');

const pageHead = <Title>Modules</Title>;

const ModuleFinderContainer = () => {
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
            <ModuleFinderSidebar />
          </div>
        </div>
      </SearchkitProvider>
    </div>
  );
};

export default ModuleFinderContainer;
