// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import { breakpointUp } from 'utils/react';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import Modal from 'views/components/Modal';
import appConfig from 'config';
import type { ModuleSelectList } from 'types/reducers';

import styles from './ModulesSelect.scss';

type Props = {
  moduleList: ModuleSelectList,
  onChange: Function,
  placeholder: string,
};

type State = {
  isModalOpen: boolean,
  isDesktop: boolean,
};

const RESULTS_LIMIT = 500;
const DOWNSHIFT_FLAGS = { resetInputOnSelection: true };

class ModulesSelect extends Component<Props, State> {
  mql: ?MediaQueryList;
  state = {
    isModalOpen: false,
    isDesktop: false,
  };

  componentDidMount() {
    const mql = breakpointUp('md');
    mql.addListener(e => this.updateMediaQuery(e));
    this.updateMediaQuery(mql);
    this.mql = mql;
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return _.size(this.props.moduleList) !== _.size(nextProps.moduleList) || !_.isEqual(this.state, nextState);
  }

  componentWillUnmount() {
    if (this.mql) {
      this.mql.removeListener(this.updateMediaQuery);
    }
  }

  onChange = (selection: any) => {
    return selection && this.props.onChange(selection);
  };

  openModal = () => {
    this.setState({ isModalOpen: true });
  };
  closeModal = () => {
    this.setState({ isModalOpen: false });
  };
  updateMediaQuery = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches === this.state.isDesktop) {
      return;
    }
    this.setState({ isDesktop: e.matches });
  };

  getFilteredModules = (inputValue: string) => {
    if (!inputValue) {
      return [];
    }

    const predicate = createSearchPredicate(inputValue);
    const results = this.props.moduleList.filter(predicate);

    return sortModules(inputValue, results.slice(0, RESULTS_LIMIT));
  };

  /* eslint-disable jsx-a11y/label-has-for, jsx-a11y/no-autofocus */
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderDropdown = ({ getLabelProps, getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }: any) => {
    const { placeholder } = this.props;
    return (
      <div className={styles.container}>
        <label className="sr-only" {...getLabelProps()}>
          {placeholder}
        </label>
        <input autoFocus={this.state.isModalOpen} className={styles.input} {...getInputProps({ placeholder })} />
        {isOpen && (
          <ol className={styles.selectList}>
            {this.getFilteredModules(inputValue).map((module, index) => {
              const props = module.isAdded
                ? {
                  key: module.ModuleCode,
                }
                : getItemProps({
                  key: module.ModuleCode,
                  item: module.ModuleCode,
                  index,
                });
              return (
                <li
                  {...props}
                  className={classnames(styles.option, {
                    [styles.optionSelected]: highlightedIndex === index,
                    [styles.optionDisabled]: module.isAdded,
                  })}
                >
                  {module.ModuleCode} {module.ModuleTitle}
                  {module.isAdded && (
                    <div className={styles.badgeContainer}>
                      <span className="badge badge-info">Added</span>
                    </div>
                  )}
                </li>
              );
            })}
            <li className={styles.item}>
              Try &quot;GER1000&quot; or &quot;Reasoning&quot;. Searching{' '}
              <strong>{this.props.moduleList.length}</strong> modules.
            </li>
          </ol>
        )}
      </div>
    );
  };

  render() {
    const { isDesktop, isModalOpen } = this.state;
    const downshiftComponent = (
      <Downshift
        breakingChanges={DOWNSHIFT_FLAGS}
        selectedItem={''}
        onChange={this.onChange}
        render={this.renderDropdown}
        defaultIsOpen={!isDesktop}
      />
    );
    return isDesktop ? (
      downshiftComponent
    ) : (
      <div>
        <button className={styles.input} onClick={this.openModal}>
          {this.props.placeholder}
        </button>
        <Modal isOpen={isModalOpen} onRequestClose={this.closeModal} className={styles.modal}>
          <h3 className="h4">Semester {appConfig.semester}</h3>
          {downshiftComponent}
        </Modal>
      </div>
    );
  }
}

export default ModulesSelect;
