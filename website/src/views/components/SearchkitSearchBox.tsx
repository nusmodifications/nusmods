import React from 'react';
import {
  QueryAccessor,
  SearchkitComponent,
  SearchkitComponentProps,
  SearchOptions,
} from 'searchkit';
import classnames from 'classnames';

import elements from 'views/elements';
import SearchBox from 'views/components/SearchBox';

// The default URL query string key used for the search term
const DEFAULT_SEARCH_QUERY_KEY = 'q';

// This should be SearchBoxProps from https://github.com/searchkit/searchkit/blob/016c899c97f72ea3ad5afc017345e41c9003172a/packages/searchkit/src/components/search/search-box/SearchBox.tsx
type SearchBoxProps = SearchkitComponentProps &
  Pick<
    SearchOptions,
    'queryFields' | 'queryBuilder' | 'queryOptions' | 'prefixQueryFields' | 'prefixQueryOptions'
  > & {
    id?: string;
    placeholder?: string;
  };

interface Props extends SearchBoxProps {
  throttle: number;
}

type State = {
  input?: string;
};

/**
 * A Searchkit wrapper around our SearchBox.
 * @see Adapted from [Searchkit's SearchBox component](https://github.com/searchkit/searchkit/blob/016c899c97f72ea3ad5afc017345e41c9003172a/packages/searchkit/src/components/search/search-box/SearchBox.tsx).
 */
export default class SearchkitSearchBox extends SearchkitComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      input: undefined,
    };
  }

  queryAccessor() {
    return this.accessor as QueryAccessor;
  }

  defineAccessor() {
    const {
      id,
      prefixQueryFields,
      queryFields,
      queryBuilder,
      queryOptions,
      prefixQueryOptions,
    } = this.props;
    return new QueryAccessor(id || DEFAULT_SEARCH_QUERY_KEY, {
      prefixQueryFields,
      prefixQueryOptions: { ...prefixQueryOptions },
      queryFields: queryFields || ['_all'],
      queryOptions: { ...queryOptions },
      queryBuilder,
      onQueryStateChange: () => {
        if (!this.unmounted && this.state.input) {
          this.setState({ input: undefined });
        }
      },
    });
  }

  getValue() {
    const { input } = this.state;
    if (typeof input === 'undefined') {
      return this.getAccessorValue();
    }
    return input;
  }

  getAccessorValue() {
    return (this.queryAccessor().state.getValue() || '').toString();
  }

  handleQueryChange = (searchString: string) => {
    this.setState({ input: searchString });
  };

  handleSearch = () => {
    this.queryAccessor().setQueryString(this.getValue().trim());
    this.searchkit.performSearch();
  };

  handleBlur = () => {
    // Flush (should use accessor's state now)
    this.setState({ input: undefined });
  };

  render() {
    if (!this.queryAccessor()) return null;
    return (
      <SearchBox
        className={classnames(elements.moduleFinderSearchBox, 'search-panel')}
        throttle={this.props.throttle}
        useInstantSearch
        isLoading={this.isLoading()}
        value={this.getValue()}
        placeholder={this.props.placeholder}
        onChange={this.handleQueryChange}
        onSearch={this.handleSearch}
        onBlur={this.handleBlur}
      />
    );
  }
}
