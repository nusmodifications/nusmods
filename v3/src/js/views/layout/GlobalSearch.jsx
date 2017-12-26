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

import styles from './GlobalSearch.scss';

type Props = {
  getResults: string => [ModuleList, VenueList],
  onChange: (Venue | Module) => void,
};

type State = {
  isOpen: boolean,
};

const PLACEHOLDER = 'Search modules & venues. Try "GER1000" or "LT".';

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

  onChange = (item: Venue | Module) => {
    this.props.onChange(item);
    this.onClose();
  };

  // Downshift attaches label for us, so we can ignore ESLint here
  /* eslint-disable jsx-a11y/label-has-for */
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderDropdown = ({ getLabelProps, getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }: any) => {
    const [modules, venues] = this.props.getResults(inputValue);
    const hasModules = modules.length > 0;
    const hasVenues = venues.length > 0;

    return (
      <div className={styles.container}>
        <Search className={classnames(styles.icon, { [styles.iconOpen]: isOpen })} />
        <label className="sr-only" {...getLabelProps()}>
          {PLACEHOLDER}
        </label>
        <input
          ref={(input) => { this.input = input; }}
          className={classnames(styles.input, { [styles.inputOpen]: isOpen })}
          {...getInputProps({ placeholder: PLACEHOLDER })}
          onFocus={this.onOpen}
        />

        {(hasModules || hasVenues) &&
          <div className={styles.selectList}>
            {hasModules && (
              <Fragment>
                <div className={styles.selectHeader}>Modules</div>
                {modules.map((module, index) => (
                  <div
                    {...getItemProps({
                      key: module.ModuleCode,
                      item: module,
                      index,
                    })}
                    className={classnames(styles.option, {
                      [styles.optionSelected]: highlightedIndex === index,
                    })}
                  >
                    {highlight(`${module.ModuleCode} ${module.ModuleTitle}`, inputValue)}
                  </div>
                ))}
              </Fragment>
            )}
            {hasVenues && (
              <Fragment>
                <div className={styles.selectHeader}>Venues</div>
                {venues.map((venue, index) => {
                  const combinedIndex = modules.length + index;
                  return (
                    <div
                      {...getItemProps({
                        key: venue,
                        item: venue,
                        index: combinedIndex,
                      })}
                      className={classnames(styles.option, {
                        [styles.optionSelected]: highlightedIndex === combinedIndex,
                      })}
                    >
                      {highlight(venue, inputValue)}
                    </div>
                  );
                })}
              </Fragment>
            )}
          </div>
        }
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
