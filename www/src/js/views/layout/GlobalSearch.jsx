// @flow
import React, { Component, Fragment } from 'react';
import { stubString } from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import { highlight } from 'utils/react';
import { Search } from 'views/components/icons';
import type { Module } from 'types/modules';
import type { Venue } from 'types/venues';
import type { ModuleList, VenueList } from 'types/reducers';
import type { ResultType } from 'types/views';

import { MODULE_RESULT, SEARCH_RESULT, VENUE_RESULT } from 'types/views';
import styles from './GlobalSearch.scss';

type Props = {
  getResults: string => [ModuleList, VenueList, string[]],

  onSelectVenue: Venue => void,
  onSelectModule: Module => void,
  onSearchModule: string => void,
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
    const { onSelectModule, onSelectVenue, onSearchModule } = this.props;

    switch (resultType) {
      case VENUE_RESULT:
        onSelectVenue(item);
        break;

      case MODULE_RESULT:
        onSelectModule(item);
        break;

      case SEARCH_RESULT:
      default:
        onSearchModule(item);
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
    const [modules, venues, highlightTokens] = this.props.getResults(inputValue);
    const hasModules = modules.length > 0;
    const hasVenues = venues.length > 0;

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
                <div className={styles.selectHeader}>Modules</div>
                {modules.map((module, index) => (
                  <div
                    {...getItemProps({
                      key: module.ModuleCode,
                      item: [MODULE_RESULT, module],
                    })}
                    className={classnames(styles.option, {
                      [styles.optionSelected]: highlightedIndex === index,
                    })}
                  >
                    {highlight(`${module.ModuleCode} ${module.ModuleTitle}`, highlightTokens)}
                  </div>
                ))}
                <div
                  {...getItemProps({
                    item: [SEARCH_RESULT, inputValue],
                  })}
                  className={classnames(styles.option, {
                    [styles.optionSelected]: highlightedIndex === modules.length,
                  })}
                >
                  View all modules with &apos;{inputValue}&apos;...
                </div>
              </Fragment>
            )}
            {hasVenues && (
              <Fragment>
                <div className={styles.selectHeader}>Venues</div>
                {venues.map((venue, index) => {
                  const combinedIndex = modules.length ? modules.length + 1 + index : index;
                  return (
                    <div
                      {...getItemProps({
                        key: venue,
                        item: [VENUE_RESULT, venue],
                      })}
                      className={classnames(styles.option, {
                        [styles.optionSelected]: highlightedIndex === combinedIndex,
                      })}
                    >
                      {highlight(venue, highlightTokens)}
                    </div>
                  );
                })}
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
