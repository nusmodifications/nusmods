// @flow
import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Downshift from 'downshift';
import classnames from 'classnames';

import { modulePage, venuePage } from 'views/routes/paths';
import { Search } from 'views/components/icons';
import type { ModuleList, VenueList } from 'types/reducers';

import styles from './GlobalSearch.scss';

type Props = {
  getResults: string => [ModuleList, VenueList],
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
                <Link
                  {...getItemProps({
                    key: module.ModuleCode,
                    item: module.ModuleCode,
                    index,
                  })}
                  className={classnames(styles.option, {
                    [styles.optionSelected]: highlightedIndex === index,
                  })}
                  to={modulePage(module.ModuleCode, module.ModuleTitle)}
                >
                  {`${module.ModuleCode} ${module.ModuleTitle}`}
                </Link>
              ))}
            </Fragment>
          )}
          {venues.length > 0 && (
            <Fragment>
              <div className={styles.selectHeader}>Venues</div>
              {venues.map((venue, index) => {
                const combinedIndex = modules.length + index;
                return (
                  <Link
                    {...getItemProps({
                      key: venue,
                      item: venue,
                      index: combinedIndex,
                    })}
                    className={classnames(styles.option, {
                      [styles.optionSelected]: highlightedIndex === combinedIndex,
                    })}
                    to={venuePage(venue)}
                  >
                    {venue}
                  </Link>
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
        onChange={this.onClose}
        /* Hack to force item selection to be empty */
        itemToString={_.stubString}
        selectedItem={''}
      />
    );
  }
}

export default GlobalSearch;
