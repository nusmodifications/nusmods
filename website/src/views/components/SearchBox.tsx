import * as React from 'react';
import classnames from 'classnames';
import { debounce } from 'lodash';

import LoadingSpinner from 'views/components/LoadingSpinner';
import { Search, X } from 'react-feather';
import styles from './SearchBox.scss';

type Props = {
  className?: string;
  throttle: number;
  isLoading: boolean;
  value: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onBlur?: () => void;
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
    if (!element) return;
    // element's onBlur callback will trigger the search flow. If we also
    // invoke onSearch in onSubmit, onSearch will be called twice.
    element.blur();
  };

  onBlur = () => {
    if (this.props.onBlur) this.props.onBlur();

    const element = this.searchElement.current;
    if (!element) return;

    // Don't search if no changes
    if (!this.state.hasChanges) return;

    const searchTerm = element.value;
    this.props.onChange(searchTerm);
    this.debouncedSearch();
    this.debouncedSearch.flush();
  };

  onInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target instanceof HTMLInputElement) {
      const searchTerm = evt.target.value;
      this.props.onChange(searchTerm);
      this.setState({ hasChanges: true });
      this.debouncedSearch();
    }
  };

  onRemoveInput = () => {
    this.props.onChange('');
    this.setState({ hasChanges: true });
    this.debouncedSearch();
  };

  private search = () => {
    this.setState({ hasChanges: false });
    this.props.onSearch();
  };

  // eslint-disable-next-line react/sort-comp
  private debouncedSearch = debounce(this.search, this.props.throttle, {
    leading: false,
  });

  render() {
    const { value, placeholder, isLoading } = this.props;
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
          {isLoading ? (
            <div className={classnames(styles.leftAccessory, styles.spinnerContainer)}>
              <LoadingSpinner className={styles.spinner} small />
            </div>
          ) : (
            <Search className={classnames(styles.leftAccessory, styles.searchIcon)} />
          )}
          {value && (
            <X
              className={styles.removeInput}
              onClick={this.onRemoveInput}
              pointerEvents="bounding-box"
            />
          )}
          <input
            id="search-box"
            className="form-control form-control-lg"
            type="search"
            autoComplete="off"
            ref={this.searchElement}
            value={value || ''}
            onChange={this.onInput}
            onFocus={() => this.setState({ isFocused: true })}
            onBlur={() => {
              this.setState({ isFocused: false });
              this.onBlur();
            }}
            placeholder={placeholder}
            spellCheck
          />
        </form>
      </div>
    );
  }
}
