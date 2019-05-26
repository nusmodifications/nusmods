import * as React from 'react';
import { QueryAccessor, SearchkitComponent, SearchkitComponentProps } from 'searchkit';
import classnames from 'classnames';

import elements from 'views/elements';
import SearchBox from 'views/components/SearchBox';

// The default URL query string key used for the search term
const DEFAULT_SEARCH_QUERY_KEY = 'q';

interface Props extends SearchkitComponentProps {
  throttle: number;
  queryFields?: string[];
  queryBuilder?: Function;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryOptions?: Record<string, any>;
  id?: string;
  placeholder?: string;
  prefixQueryFields?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prefixQueryOptions?: Record<string, any>;
}

type State = {
  input: string;
};

/**
 * A Searchkit wrapper around our SearchBox.
 * @see Adapted from [Searchkit's SearchBox component](https://github.com/searchkit/searchkit/blob/016c899c97f72ea3ad5afc017345e41c9003172a/packages/searchkit/src/components/search/search-box/SearchBox.tsx).
 */
export default class SearchkitSearchBox extends SearchkitComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      input: '', // Start off with an empty search string
    };
  }

  componentDidMount() {
    super.componentDidMount();
    // Set our value to accessor's value. SearchkitComponent should have
    // already set accessor in its componentDidMount implementation.
    this.restoreValueFromAccessor();
  }

  restoreValueFromAccessor() {
    // This will crash if queryAccessor hasn't been set (it should be set by
    // our superclass).
    const input = (this.queryAccessor().state.getValue() || '').toString();
    this.setState({ input });
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
        if (!this.unmounted) {
          this.restoreValueFromAccessor();
        }
      },
    });
  }

  handleQueryChange = (searchString: string) => {
    this.setState({ input: searchString });
  };

  handleSearch = () => {
    this.queryAccessor().setQueryString(this.state.input.trim());
    this.searchkit.performSearch();
  };

  render() {
    if (!this.queryAccessor()) return null;
    return (
      <SearchBox
        className={classnames(elements.moduleFinderSearchBox, 'search-panel')}
        throttle={this.props.throttle}
        useInstantSearch
        value={this.state.input}
        placeholder={this.props.placeholder}
        onChange={this.handleQueryChange}
        onSearch={this.handleSearch}
      />
    );
  }
}
