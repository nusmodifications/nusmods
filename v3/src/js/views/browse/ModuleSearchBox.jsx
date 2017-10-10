// @flow
import type { ContextRouter } from 'react-router-dom';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { throttle } from 'lodash';
import qs from 'query-string';

import { Search } from 'views/components/icons';
import { searchModules } from 'actions/module-finder';
import { SEARCH_QUERY_KEY } from './module-search';
import styles from './ModuleSearchBox.scss';

type Props = ContextRouter & {
  throttle: number,
  onSearch?: (string) => void,

  searchModules: (string) => void,
};

type State = {
  searchTerm: string,
  isFocused: boolean,
};

export class ModuleSearchBoxComponent extends PureComponent<Props, State> {
  props: Props;

  static defaultProps = {
    throttle: 300,
  };

  state: State = {
    isFocused: false,
    searchTerm: qs.parse(this.props.location.search)[SEARCH_QUERY_KEY] || '',
  };

  componentWillMount() {
    this.search(this.state.searchTerm);
  }

  onSearchInput = (evt: Event) => {
    if (evt.target instanceof HTMLInputElement) {
      const searchTerm = evt.target.value;
      this.setState({ searchTerm });
      this.throttledSearch(searchTerm);
    }
  };

  search = (input: string) => {
    const searchTerm = input.trim();
    if (this.props.onSearch) this.props.onSearch(searchTerm);
    this.props.searchModules(searchTerm);
  };

  throttledSearch = throttle(this.search, this.props.throttle, { leading: false });

  render() {
    return (
      <div className={classnames(styles.searchBox, { [styles.searchBoxFocused]: this.state.isFocused })}>
        <label htmlFor="module-search" className="sr-only">Search</label>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            id="module-search"
            className="form-control form-control-lg"
            type="search"
            value={this.state.searchTerm}
            onChange={this.onSearchInput}
            onFocus={() => this.setState({ isFocused: true })}
            onBlur={() => this.setState({ isFocused: false })}
            placeholder="Module code, names and descriptions"
            spellCheck
          />
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(
    state => ({ searchDescription: state.moduleFinder.search.searchDescription }),
    { searchModules },
  )(ModuleSearchBoxComponent),
);
