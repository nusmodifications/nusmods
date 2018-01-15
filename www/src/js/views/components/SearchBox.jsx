// @flow
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { debounce } from 'lodash';

import { Search } from 'views/components/icons';
import styles from './SearchBox.scss';

type Props = {
  className?: string,
  throttle: number,
  useInstantSearch: boolean,
  initialSearchTerm: ?string,
  placeholder: string,
  onSearch: string => void,
};

type State = {
  searchTerm: string,
  isFocused: boolean,
  hasChanges: boolean,
};

export default class SearchBox extends PureComponent<Props, State> {
  props: Props;
  searchElement: ?HTMLInputElement;

  state: State = {
    isFocused: false,
    searchTerm: this.props.initialSearchTerm || '',
    hasChanges: false,
  };

  componentWillMount() {
    this.search(this.state.searchTerm);
  }

  onSubmit = () => {
    const { searchElement } = this;

    if (searchElement) {
      const searchTerm = searchElement.value;
      this.setState({ searchTerm });

      this.debouncedSearch(searchTerm);
      this.debouncedSearch.flush();
      searchElement.blur();
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
    this.props.onSearch(input.trim());
  };

  debouncedSearch: string => void = debounce(this.search, this.props.throttle, { leading: false });

  showSubmitHelp() {
    return (
      !this.props.useInstantSearch &&
      this.state.hasChanges &&
      this.searchElement &&
      this.searchElement.value
    );
  }

  render() {
    return (
      <div
        className={classnames(this.props.className, {
          [styles.searchBoxFocused]: this.state.isFocused,
        })}
      >
        <label htmlFor="search-box" className="sr-only">
          Search
        </label>
        <form
          className={styles.searchWrapper}
          onSubmit={(evt) => {
            this.onSubmit();
            evt.preventDefault();
          }}
        >
          <Search className={styles.searchIcon} />
          <input
            id="search-box"
            className="form-control form-control-lg"
            type="search"
            ref={(e) => {
              this.searchElement = e;
            }}
            value={this.state.searchTerm}
            onChange={this.onInput}
            onFocus={() => this.setState({ isFocused: true })}
            onBlur={() => {
              this.setState({ isFocused: false });
              this.onSubmit();
            }}
            placeholder={this.props.placeholder}
            spellCheck
          />
        </form>

        {this.showSubmitHelp() && <p className={styles.searchHelp}>Press enter to search</p>}
      </div>
    );
  }
}
