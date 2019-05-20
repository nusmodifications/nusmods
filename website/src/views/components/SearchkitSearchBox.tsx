import * as React from 'react';
import { QueryAccessor, SearchkitComponent, SearchkitComponentProps } from 'searchkit';
import classnames from 'classnames';
import { assign } from 'lodash';

import elements from 'views/elements';
import SearchBox from 'views/components/SearchBox';

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
  input?: string;
};

/**
 * A Searchkit wrapper around our SearchBox.
 * @see Adapted from <a href="https://github.com/searchkit/searchkit/blob/016c899c97f72ea3ad5afc017345e41c9003172a/packages/searchkit/src/components/search/search-box/SearchBox.tsx">Searchkit's SearchBox component</a>.
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
    return new QueryAccessor(id || 'q', {
      prefixQueryFields,
      prefixQueryOptions: assign({}, prefixQueryOptions),
      queryFields: queryFields || ['_all'],
      queryOptions: assign({}, queryOptions),
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

  render() {
    if (!this.queryAccessor()) return null;
    return (
      <SearchBox
        className={classnames(elements.moduleFinderSearchBox, 'search-panel')}
        throttle={this.props.throttle}
        useInstantSearch
        value={this.getValue()}
        placeholder={this.props.placeholder}
        onChange={this.handleQueryChange}
        onSearch={this.handleSearch}
      />
    );
  }
}
