// @flow

import React, { PureComponent } from 'react';
import { throttle } from 'lodash';

type Props = {
  throttle: number,

  onSearch: (searchTerm: string) => void,
};

type State = {
  searchTerm: string,
};

export default class ModuleSearchBox extends PureComponent<Props, State> {
  props: Props;

  throttledSearch: (string) => void;

  static defaultProps = {
    throttle: 300,
  };

  constructor(props: Props) {
    super(props);

    this.throttledSearch = throttle(this.props.onSearch, this.props.throttle, { leading: false });
  }

  state: State = {
    searchTerm: '',
  };

  onSearchInput = (evt: Event) => {
    if (evt.target instanceof HTMLInputElement) {
      const searchTerm = evt.target.value;
      this.setState({ searchTerm });
      this.throttledSearch(searchTerm);
    }
  };

  render() {
    return (
      <div>
        <input
          className="form-control form-control-lg"
          type="search"
          value={this.state.searchTerm}
          onInput={this.onSearchInput}
        />
      </div>
    );
  }
}
