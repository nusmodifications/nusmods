import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ReactiveComponent } from '@appbaseio/reactivesearch';
import classnames from 'classnames';
import { fromPairs } from 'lodash';

import elements from 'views/elements';
import SearchBox from 'views/components/SearchBox';

type Props = RouteComponentProps & {
  componentId: string;
  URLParams?: boolean;
};

export const ModuleSearchBoxComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { dataField, componentId, URLParams } = props;

  const createQuery = (searchString: string) => {
    return {
      query: {
        bool: {
          should: [
            {
              // eslint-disable-next-line @typescript-eslint/camelcase
              multi_match: {
                query: searchString,
                fields: dataField,
                type: 'best_fields',
                operator: 'or',
                fuzziness: 'AUTO',
              },
            },
            {
              // eslint-disable-next-line @typescript-eslint/camelcase
              multi_match: {
                query: searchString,
                fields: dataField,
                type: 'phrase_prefix',
                operator: 'or',
              },
            },
          ],
          minimum_should_match: '1', // eslint-disable-line @typescript-eslint/camelcase
        },
      },
    };
  };

  // TODO: Fix bug where navigating back/forward in the browser doesn't change
  // search box text. May need to change SearchBox to be a controlled component.
  return (
    <ReactiveComponent
      componentId={componentId}
      showFilter={false}
      URLParams={URLParams}
      render={({ setQuery, value }) => (
        <SearchBox
          className={classnames(elements.moduleFinderSearchBox, 'search-panel')}
          throttle={300}
          useInstantSearch
          initialSearchTerm={value || null}
          placeholder="Module code, names and descriptions"
          onSearch={(searchString) => {
            if (searchString.trim().length === 0) {
              setQuery(null);
              return;
            }
            setQuery({ query: createQuery(searchString), value: searchString });
          }}
        />
      )}
    />
  );
};

export default withRouter(ModuleSearchBoxComponent);
