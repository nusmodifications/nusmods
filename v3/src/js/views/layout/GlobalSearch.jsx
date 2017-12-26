// @flow
import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

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

const PLACEHOLDER = 'Search modules & venues';

class GlobalSearch extends Component<Props, State> {
  state = {
    isOpen: false,
  };

  onOpen = () => {
    this.setState({ isOpen: true });
  };
  onClose = () => {
    this.setState({ isOpen: false });
  };
  onChange = (item: Venue | Module) => {
    this.props.onChange(item);
    this.onClose();
  };

  // downshift attaches label for us; autofocus only applies to modal
  /* eslint-disable jsx-a11y/label-has-for */
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderDropdown = ({ getLabelProps, getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }: any) => {
    const [modules, venues] = this.props.getResults(inputValue);
    const hasResults = modules.length > 0 || venues.length > 0;
    const showTip = isOpen && !hasResults;
    return (
      <div className={styles.container}>
        <Search className={classnames(styles.icon, { [styles.iconOpen]: isOpen })} />
        <label className="sr-only" {...getLabelProps()}>
          {PLACEHOLDER}
        </label>
        <input
          className={classnames(styles.input, { [styles.inputOpen]: isOpen })}
          {...getInputProps({ placeholder: PLACEHOLDER })}
          onFocus={this.onOpen}
        />
        <div className={styles.selectList}>
          {modules.length > 0 && (
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
                  {`${module.ModuleCode} ${module.ModuleTitle}`}
                </div>
              ))}
            </Fragment>
          )}
          {venues.length > 0 && (
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
                    {venue}
                  </div>
                );
              })}
            </Fragment>
          )}
          {showTip && <div className={styles.item}>Try &quot;GER1000&quot; or &quot;LT&quot;.</div>}
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
        itemToString={_.stubString}
        selectedItem={''}
      />
    );
  }
}

export default GlobalSearch;
