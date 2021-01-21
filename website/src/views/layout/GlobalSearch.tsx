import { Component, Fragment } from 'react';
import { omit, stubString } from 'lodash';
import Downshift, { ChildrenFunction, DownshiftState, StateChangeOptions } from 'downshift';
import classnames from 'classnames';
import { ChevronRight, HelpCircle as Help, Search } from 'react-feather';

import { highlight } from 'utils/react';
import { ModuleCondensed } from 'types/modules';
import { Venue } from 'types/venues';
import {
  MODULE_RESULT,
  ResultType,
  SEARCH_RESULT,
  SearchItem,
  SearchResult,
  VENUE_RESULT,
} from 'types/views';

import ComponentMap from 'utils/ComponentMap';
import SemesterBadge from 'views/components/SemesterBadge';
import styles from './GlobalSearch.scss';

export type Props = {
  getResults: (string: string | null) => SearchResult | null;

  onSelectVenue: (venue: Venue) => void;
  onSelectModule: (moduleCondensed: ModuleCondensed) => void;
  onSearch: (resultType: ResultType, str: string) => void;
};

type State = {
  inputValue: string;
};

const PLACEHOLDER = 'Search NUSMods';

class GlobalSearch extends Component<Props, State> {
  input: HTMLInputElement | null = null;

  state = {
    inputValue: '',
  };

  handleClose = () => {
    this.setState({ inputValue: '' });

    if (this.input) this.input.blur();
  };

  handleOuterClick = () => {
    // Preserve input value (if present) after user clicks outside.
    if (this.state.inputValue) {
      this.setState({
        // Cannot use prevState as prevState.inputValue will be empty string
        // instead of the (non-empty) this.state.inputValue.
        // eslint-disable-next-line react/no-access-state-in-setstate
        inputValue: this.state.inputValue,
      });

      if (this.input) this.input.blur();
    } else {
      this.handleClose();
    }
  };

  handleInputValueChange = (newInputValue: string) => {
    this.setState({ inputValue: newInputValue });
  };

  handleChange = (item: SearchItem | null) => {
    if (item) {
      const { onSelectModule, onSelectVenue, onSearch } = this.props;

      switch (item.type) {
        case VENUE_RESULT:
          onSelectVenue(item.venue);
          break;

        case MODULE_RESULT:
          onSelectModule(item.module);
          break;

        case SEARCH_RESULT:
          onSearch(item.type, item.term);
          break;
      }
    }

    this.handleClose();
  };

  stateReducer = (state: DownshiftState<SearchItem>, changes: StateChangeOptions<SearchItem>) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.blurInput:
        return omit(changes, 'inputValue');
      default:
        return changes;
    }
  };

  // Downshift attaches label for us, so we can ignore ESLint here
  /* eslint-disable jsx-a11y/label-has-for */
  renderDropdown: ChildrenFunction<SearchItem> = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    inputValue,
    highlightedIndex,
  }) => {
    // key to ensure the input element does not change during rerender, which would cause
    // selection to be lost
    const searchForm = (
      <Fragment key="search">
        <Search className={styles.icon} />
        <label className="sr-only" {...getLabelProps()}>
          {PLACEHOLDER}
        </label>
        <input
          ref={(r) => {
            this.input = r;
            ComponentMap.globalSearchInput = r;
          }}
          className={classnames('form-control', styles.input)}
          {...getInputProps({ placeholder: PLACEHOLDER })}
        />
      </Fragment>
    );

    const searchResults = this.props.getResults(inputValue);
    const hasFocus = document.activeElement === this.input;

    // 1. Search is not active - just show the search form
    if (!searchResults || !inputValue || !hasFocus) {
      return <div className={styles.container}>{searchForm}</div>;
    }

    const { modules, venues, tokens } = searchResults;
    const hasModules = modules.length > 0;
    const hasVenues = venues.length > 0;

    // 2. No results - show a message and ask if the user wants to view all
    //    results instead
    if (!hasModules && !hasVenues) {
      return (
        <div className={styles.container}>
          {searchForm}

          <div className={styles.selectListContainer}>
            <div className={styles.selectList}>
              <div className={styles.noResults}>
                <Help />
                <p>
                  No results found for{' '}
                  <strong className={styles.searchTerm}>
                    &quot;
                    {inputValue}
                    &quot;
                  </strong>
                </p>
                <p>
                  Try searching all{' '}
                  <button
                    {...getItemProps({
                      item: { type: SEARCH_RESULT, result: MODULE_RESULT, term: inputValue },
                    })}
                    className={classnames('btn btn-inline', {
                      [styles.selected]: highlightedIndex === 0,
                    })}
                    type="button"
                  >
                    modules
                  </button>{' '}
                  or{' '}
                  <button
                    {...getItemProps({
                      item: { type: SEARCH_RESULT, result: VENUE_RESULT, term: inputValue },
                    })}
                    className={classnames('btn btn-inline', {
                      [styles.selected]: highlightedIndex === 1,
                    })}
                    type="button"
                  >
                    venues
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const venueHeaderIndex = hasModules ? modules.length + 1 : 0;
    const venueItemOffset = venueHeaderIndex + 1;

    // 3. We have results - so show them to the user
    return (
      <div className={styles.container}>
        {searchForm}

        {/* Wrap select list in absolute-positioned container to fix macOS Safari scrolling perf */}
        <div className={styles.selectListContainer}>
          <div className={styles.selectList} {...getMenuProps()}>
            {hasModules && (
              <>
                <div
                  {...getItemProps({
                    item: { type: SEARCH_RESULT, result: MODULE_RESULT, term: inputValue },
                  })}
                  className={classnames(styles.selectHeader, {
                    [styles.selected]: highlightedIndex === 0,
                  })}
                >
                  <span className="btn-svg">
                    View All <ChevronRight className={styles.svg} />
                  </span>
                  <span className={styles.headerName}>Modules</span>
                </div>

                {modules.map((module, index) => (
                  <div
                    {...getItemProps({
                      key: module.moduleCode,
                      item: { type: MODULE_RESULT, module },
                    })}
                    className={classnames(styles.option, {
                      [styles.selected]: highlightedIndex === index + 1,
                    })}
                  >
                    <span>{highlight(`${module.moduleCode} ${module.title}`, tokens)}</span>

                    <SemesterBadge className={styles.semesters} semesters={module.semesters} />
                  </div>
                ))}
              </>
            )}

            {hasVenues && (
              <>
                <div
                  {...getItemProps({
                    item: { type: SEARCH_RESULT, result: VENUE_RESULT, term: inputValue },
                  })}
                  className={classnames(styles.selectHeader, {
                    [styles.selected]: highlightedIndex === venueHeaderIndex,
                  })}
                >
                  <span className="btn-svg">
                    View All <ChevronRight className={styles.svg} />
                  </span>
                  <span className={styles.headerName}>Venues</span>
                </div>

                {venues.map((venue, index) => (
                  <div
                    {...getItemProps({
                      key: venue,
                      item: { type: VENUE_RESULT, venue },
                    })}
                    className={classnames(styles.option, {
                      [styles.selected]: highlightedIndex === venueItemOffset + index,
                    })}
                  >
                    <span>{highlight(venue, tokens)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { inputValue } = this.state;

    return (
      <Downshift
        onOuterClick={this.handleOuterClick}
        onChange={this.handleChange}
        onInputValueChange={this.handleInputValueChange}
        inputValue={inputValue}
        stateReducer={this.stateReducer}
        /* Hack to force item selection to be empty */
        itemToString={stubString}
      >
        {this.renderDropdown}
      </Downshift>
    );
  }
}

export default GlobalSearch;
