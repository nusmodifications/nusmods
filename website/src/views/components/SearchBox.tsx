import * as React from 'react';
import classnames from 'classnames';
import { debounce } from 'lodash';

import { Search } from 'views/components/icons';
import styles from './SearchBox.scss';

type Props = {
  className?: string;
  throttle: number;
  useInstantSearch: boolean;
  value: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

type State = {
  isFocused: boolean;
  hasChanges: boolean;
};

export default class SearchBox extends React.PureComponent<Props, State> {
  searchElement = React.createRef<HTMLInputElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      isFocused: false,
      hasChanges: false,
    };
  }

  onSubmit = () => {
    const element = this.searchElement.current;

    if (element) {
      const searchTerm = element.value;
      this.props.onChange(searchTerm);
      this.debouncedSearch();
      this.debouncedSearch.flush();
      element.blur();
    }
  };

  onInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target instanceof HTMLInputElement) {
      const searchTerm = evt.target.value;
      this.props.onChange(searchTerm);
      this.setState({ hasChanges: true });
      if (this.props.useInstantSearch) this.debouncedSearch();
    }
  };

  private search = () => {
    this.setState({ hasChanges: false });
    this.props.onSearch();
  };

  // eslint-disable-next-line react/sort-comp
  private debouncedSearch = debounce(this.search, this.props.throttle, {
    leading: false,
  });

  showSubmitHelp() {
    return (
      !this.props.useInstantSearch &&
      this.state.hasChanges &&
      this.searchElement.current &&
      this.searchElement.current.value
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
            autoComplete="off"
            ref={this.searchElement}
            value={this.props.value || ''}
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
