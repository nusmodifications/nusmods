// @flow
import type { ContextRouter } from 'react-router-dom';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { throttle } from 'lodash';
import qs from 'query-string';

import { searchModules } from 'actions/module-finder';

type Props = ContextRouter & {
  throttle: number,
  onSearch?: (string) => void,

  searchModules: (string) => void,
};

type State = {
  searchTerm: string,
};

export class ModuleSearchBoxComponent extends PureComponent<Props, State> {
  props: Props;

  static defaultProps = {
    throttle: 300,
  };

  state: State = {
    searchTerm: qs.parse(this.props.location.search).q || '',
  };

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
      <div>
        <input
          className="form-control form-control-lg"
          type="search"
          value={this.state.searchTerm}
          onChange={this.onSearchInput}
          spellCheck
        />
      </div>
    );
  }
}

export default withRouter(
  connect(null, { searchModules })(ModuleSearchBoxComponent),
);
