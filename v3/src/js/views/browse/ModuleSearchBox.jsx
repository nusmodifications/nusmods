// @flow
import type { ContextRouter } from 'react-router-dom';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { debounce } from 'lodash';
import qs from 'query-string';

import { Search } from 'views/components/icons';
import { searchModules } from 'actions/module-finder';
import { SEARCH_QUERY_KEY } from './module-search';
import styles from './ModuleSearchBox.scss';

type Props = ContextRouter & {
  throttle: number,
  useInstantSearch: boolean,

  searchModules: (string) => void,
};

type State = {
  searchTerm: string,
  isFocused: boolean,
  hasChanges: boolean,
};

export class ModuleSearchBoxComponent extends PureComponent<Props, State> {
  searchElement: ?HTMLInputElement;

  static defaultProps = {
    useInstantSearch: false,
    throttle: 300,
  };

  state: State = {
    isFocused: false,
    searchTerm: qs.parse(this.props.location.search)[SEARCH_QUERY_KEY] || '',
    hasChanges: false,
  };

  componentWillMount() {
    this.search(this.state.searchTerm);
  }

  onSubmit = () => {
    if (this.searchElement) {
      const searchTerm = this.searchElement.value;
      this.setState({ searchTerm });

      this.debouncedSearch(searchTerm);
      this.debouncedSearch.flush();
    }
  };

  onInput = (evt: Event) => {
    if (evt.target instanceof HTMLInputElement) {
      const searchTerm = evt.target.value;
      this.setState({ searchTerm, hasChanges: true });

      if (this.props.useInstantSearch) this.debouncedSearch(searchTerm);
    }
  };

  search = (input: string) => {
    this.setState({ hasChanges: false });
    this.props.searchModules(input.trim());
  };

  debouncedSearch: (string) => void = debounce(this.search, this.props.throttle, { leading: false });

  render() {
    return (
      <div className={classnames(styles.searchBox, { [styles.searchBoxFocused]: this.state.isFocused })}>
        <label htmlFor="module-search" className="sr-only">Search</label>
        <form
          className={styles.searchWrapper}
          onSubmit={(evt) => {
            this.onSubmit();
            evt.preventDefault();
          }}
        >
          <Search className={styles.searchIcon} />
          <input
            id="module-search"
            className="form-control form-control-lg"
            type="search"
            ref={(e) => { this.searchElement = e; }}
            value={this.state.searchTerm}
            onChange={this.onInput}
            onFocus={() => this.setState({ isFocused: true })}
            onBlur={() => {
              this.setState({ isFocused: false });
              this.onSubmit();
            }}
            placeholder="Module code, names and descriptions"
            spellCheck
          />
        </form>

        {!this.props.useInstantSearch && this.state.hasChanges && <p className={styles.searchHelp}>
          Press enter to search
        </p>}
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
