import * as React from 'react';
import {
  Hits,
  HitsStats,
  HitsStatsDisplayProps,
  InitialLoader,
  LoadingComponent,
  HitsListProps,
  NoHits,
  SearchkitManager,
  SearchkitProvider,
} from 'searchkit';
import classnames from 'classnames';

import { ElasticSearchResult } from 'types/vendor/elastic-search';
import { ModuleInformation } from 'types/modules';

import ModuleFinderSidebar from 'views/modules/ModuleFinderSidebar';
import ModuleSearchBox from 'views/modules/ModuleSearchBox';
import ModuleFinderNoHits from 'views/errors/ModuleFinderNoHits';
import ModuleFinderApiError from 'views/errors/ModuleFinderApiError';
import ModuleFinderPager from 'views/modules/ModuleFinderPager';
import ModuleFinderItem from 'views/modules/ModuleFinderItem';
import Pagination from 'views/components/searchkit/Pagination';
import Title from 'views/components/Title';

import { forceElasticsearchHost } from 'utils/debug';
import { HIGHLIGHT_OPTIONS } from 'utils/elasticSearch';
import config from 'config';
import styles from './ModuleFinderContainer.scss';

const esIndex = 'modules_v2';
const esHostUrl = `${forceElasticsearchHost() || config.elasticsearchBaseUrl}/${esIndex}`;
const searchkit = new SearchkitManager(esHostUrl, {
  // Ensure displayed no. modules found is accurate.
  searchUrlPath: '_search?track_total_hits=true',
});

const pageHead = <Title>Modules</Title>;

const ModuleInformationListComponent: React.FC<HitsListProps> = ({ hits }) => (
  <ul className={styles.modulesList}>
    {hits.map((hit) => {
      const result = hit as ElasticSearchResult<ModuleInformation>;
      /* eslint-disable no-underscore-dangle */
      return (
        <ModuleFinderItem
          key={result._source.moduleCode}
          module={result._source}
          highlight={result.highlight}
        />
      );
      /* eslint-enable */
    })}
  </ul>
);

const ModuleFinderContainer: React.FC = () => (
  <div className={classnames(styles.modulesPageContainer, 'page-container')}>
    {pageHead}
    <SearchkitProvider searchkit={searchkit}>
      <div className="row">
        <div className="col">
          <h1 className="sr-only">Module Finder</h1>

          <ModuleSearchBox id="q" />

          <div>
            <HitsStats
              component={({ hitsCount }: HitsStatsDisplayProps) => (
                <div className={styles.modulePageDivider}>{hitsCount} modules found</div>
              )}
            />

            <LoadingComponent>
              <div className={styles.loadingOverlay} />
            </LoadingComponent>

            <InitialLoader component={LoadingComponent} />

            <Hits
              hitsPerPage={10}
              listComponent={ModuleInformationListComponent}
              customHighlight={HIGHLIGHT_OPTIONS}
              // SearchKit default incorrectly tries to set document.body.scrollTop. <html> is the correct
              // scrolling context for the viewport
              scrollTo="html"
            />

            <NoHits
              suggestionsField="title"
              component={ModuleFinderNoHits}
              errorComponent={<ModuleFinderApiError searchkit={searchkit} />}
            />
          </div>

          <Pagination pagerComponent={ModuleFinderPager} />
        </div>

        <div className="col-md-4 col-lg-3">
          <ModuleFinderSidebar />
        </div>
      </div>
    </SearchkitProvider>
  </div>
);

export default ModuleFinderContainer;
