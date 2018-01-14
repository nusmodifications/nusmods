// @flow
import React, { Component, Fragment } from 'react';
import { stubString } from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import { highlight } from 'utils/react';
import { ChevronRight, Help, Search } from 'views/components/icons';
import type { ModuleCondensed } from 'types/modules';
import type { Venue } from 'types/venues';
import type { ResultType, SearchResult } from 'types/views';

import config from 'config';
import { MODULE_RESULT, SEARCH_RESULT, VENUE_RESULT } from 'types/views';
import styles from './GlobalSearch.scss';

type Props = {
  getResults: string => ?SearchResult,

  onSelectVenue: Venue => void,
  onSelectModule: ModuleCondensed => void,
  onSearch: (ResultType, string) => void,
};

type State = {
  isOpen: boolean,
};

const PLACEHOLDER = 'Search modules & venues. Try "GER" or "LT".';

/* eslint-disable no-useless-computed-key */
const BADGE_COLOR = {
  [1]: styles.sem1,
  [2]: styles.sem2,
  [3]: styles.sem3,
  [4]: styles.sem4,
};
/* eslint-enable */

class GlobalSearch extends Component<Props, State> {
  input: ?HTMLInputElement;
  state = {
    isOpen: false,
  };

  onOpen = () => {
    this.setState({ isOpen: true });
  };

  onClose = () => {
    this.setState({ isOpen: false }, () => {
      if (this.input) this.input.blur();
    });
  };

  onChange = ([resultType, item]: [ResultType, any]) => {
    const { onSelectModule, onSelectVenue, onSearch } = this.props;

    switch (resultType) {
      case VENUE_RESULT:
        onSelectVenue(item);
        break;

      case MODULE_RESULT:
        onSelectModule(item);
        break;

      case SEARCH_RESULT:
      default:
        onSearch(...item);
    }

    this.onClose();
  };

  // Downshift attaches label for us, so we can ignore ESLint here
  /* eslint-disable jsx-a11y/label-has-for */
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderDropdown = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    isOpen,
    inputValue,
    highlightedIndex,
  }: any) => {
    // key to ensure the input element does not change during rerender, which would cause
    // selection to be lost
    const searchForm = (
      <Fragment key="search">
        <Search className={classnames(styles.icon, { [styles.iconOpen]: isOpen })} />
        <label className="sr-only" {...getLabelProps()}>
          {PLACEHOLDER}
        </label>
        <input
          ref={(input) => {
            this.input = input;
          }}
          className={classnames(styles.input, { [styles.inputOpen]: isOpen })}
          {...getInputProps({ placeholder: PLACEHOLDER })}
          onFocus={this.onOpen}
        />
      </Fragment>
    );

    const searchResults = this.props.getResults(inputValue);

    // 1. Search is not active - just show the search form
    if (!searchResults) {
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
                  <strong className={styles.searchTerm}>&quot;{inputValue}&quot;</strong>
                </p>
                <p>
                  Try searching all{' '}
                  <button
                    {...getItemProps({
                      item: [SEARCH_RESULT, [MODULE_RESULT, inputValue]],
                    })}
                    className={classnames('btn btn-inline', {
                      [styles.selected]: highlightedIndex === 0,
                    })}
                  >
                    modules
                  </button>{' '}
                  or{' '}
                  <button
                    {...getItemProps({
                      item: [SEARCH_RESULT, [VENUE_RESULT, inputValue]],
                    })}
                    className={classnames('btn btn-inline', {
                      [styles.selected]: highlightedIndex === 1,
                    })}
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
          <div className={styles.selectList}>
            {hasModules && (
              <Fragment>
                <div
                  {...getItemProps({
                    item: [SEARCH_RESULT, [MODULE_RESULT, inputValue]],
                  })}
                  className={classnames(styles.selectHeader, {
                    [styles.selected]: highlightedIndex === 0,
                  })}
                >
                  <span className={styles.headerName}>Modules</span>
                  <span className="btn-svg">
                    View All <ChevronRight className={styles.svg} />
                  </span>
                </div>

                {modules.map((module, index) => (
                  <div
                    {...getItemProps({
                      key: module.ModuleCode,
                      item: [MODULE_RESULT, module],
                    })}
                    className={classnames(styles.option, {
                      [styles.selected]: highlightedIndex === index + 1,
                    })}
                  >
                    <span>{highlight(`${module.ModuleCode} ${module.ModuleTitle}`, tokens)}</span>

                    <span className={styles.semesters}>
                      {module.Semesters.sort().map((semester) => (
                        <span
                          key={semester}
                          className={classnames('badge', BADGE_COLOR[semester])}
                          title={config.semesterNames[semester]}
                        >
                          {config.shortSemesterNames[semester]}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </Fragment>
            )}
            {hasVenues && (
              <Fragment>
                <div
                  {...getItemProps({
                    item: [SEARCH_RESULT, [VENUE_RESULT, inputValue]],
                  })}
                  className={classnames(styles.selectHeader, {
                    [styles.selected]: highlightedIndex === venueHeaderIndex,
                  })}
                >
                  <span className={styles.headerName}>Venues</span>
                  <span className="btn-svg">
                    View All <ChevronRight className={styles.svg} />
                  </span>
                </div>

                {venues.map((venue, index) => (
                  <div
                    {...getItemProps({
                      key: venue,
                      item: [VENUE_RESULT, venue],
                    })}
                    className={classnames(styles.option, {
                      [styles.selected]: highlightedIndex === venueItemOffset + index,
                    })}
                  >
                    <span>{highlight(venue, tokens)}</span>
                  </div>
                ))}
              </Fragment>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { isOpen } = this.state;
    return (
      <Downshift
        isOpen={isOpen}
        onOuterClick={this.onClose}
        render={this.renderDropdown}
        onChange={this.onChange}
        /* Hack to force item selection to be empty */
        itemToString={stubString}
        selectedItem=""
      />
    );
  }
}

export default GlobalSearch;
