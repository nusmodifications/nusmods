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

import ModuleFinderSidebar from 'views/modules/ModuleFinderSidebar';
import ModuleSearchBox from 'views/modules/ModuleSearchBox';
import ModuleFinderNoHits from 'views/errors/ModuleFinderNoHits';
import ModuleFinderApiError from 'views/errors/ModuleFinderApiError';
import ModuleFinderPager from 'views/components/ModuleFinderPager';
import { ModuleFinderHitModuleItem } from 'views/components/ModuleFinderItem';
import LoadingSpinner from 'views/components/LoadingSpinner';
import Title from 'views/components/Title';

import { forceElasticsearchHost } from 'utils/debug';
import config from 'config';

export type Props = {};

const esHostUrl = `${forceElasticsearchHost() || config.elasticsearchBaseUrl}/modules`;
const searchkit = new SearchkitManager(esHostUrl);

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
              <Hits hitsPerPage={10} itemComponent={ModuleFinderHitModuleItem} />
              <NoHits
                suggestionsField="title"
                component={ModuleFinderNoHits}
                errorComponent={ModuleFinderApiError}
              />
              <InitialLoader component={LoadingSpinner} />
            </ul>
            <Pagination showNumbers listComponent={ModuleFinderPager} />
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
