// @flow
import React, { Component, Fragment } from 'react';
import { stubString } from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import { highlight } from 'utils/react';
import { Search, ChevronRight } from 'views/components/icons';
import type { Module } from 'types/modules';
import type { Venue } from 'types/venues';
import type { ResultType, SearchResult } from 'types/views';

import { MODULE_RESULT, SEARCH_RESULT, VENUE_RESULT } from 'types/views';
import styles from './GlobalSearch.scss';

type Props = {
  getResults: string => SearchResult,

  onSelectVenue: Venue => void,
  onSelectModule: Module => void,
  onSearch: (ResultType, string) => void,
};

type State = {
  isOpen: boolean,
};

const PLACEHOLDER = 'Search modules & venues. Try "GER" or "LT".';

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
    const { modules, venues, tokens } = this.props.getResults(inputValue);
    const hasModules = modules.length > 0;
    const hasVenues = venues.length > 0;

    const venueHeaderIndex = hasModules ? modules.length + 1 : 0;
    const venueItemOffset = venueHeaderIndex + 1;

    return (
      <div className={styles.container}>
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

        {(hasModules || hasVenues) && (
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
                  <span className={styles.viewAll}>
                    View All <ChevronRight />
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
                    {highlight(`${module.ModuleCode} ${module.ModuleTitle}`, tokens)}
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
                  <span className={styles.viewAll}>
                    View All <ChevronRight />
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
                    {highlight(venue, tokens)}
                  </div>
                ))}
              </Fragment>
            )}
          </div>
        )}
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
