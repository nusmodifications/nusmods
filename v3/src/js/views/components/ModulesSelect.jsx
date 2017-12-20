// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import makeResponsive from 'views/hocs/makeResponsive';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import type { ModuleSelectList } from 'types/reducers';

import styles from './ModulesSelect.scss';

type Props = {
  moduleList: ModuleSelectList,
  onChange: Function,
  placeholder: string,
  isMatchBreakpoint: boolean,
};

type State = {
  isModalOpen: boolean,
  isFocused: boolean,
};

const RESULTS_LIMIT = 500;
const DOWNSHIFT_FLAGS = { resetInputOnSelection: true };

class ModulesSelect extends Component<Props, State> {
  state = {
    isModalOpen: false,
    isFocused: false,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      _.size(this.props.moduleList) !== _.size(nextProps.moduleList) ||
      this.props.isMatchBreakpoint !== nextProps.isMatchBreakpoint ||
      !_.isEqual(this.state, nextState)
    );
  }

  onChange = (selection: any) => {
    return selection && this.props.onChange(selection);
  };

  onFocus = () => this.setState({ isFocused: true });
  onBlur = () => this.setState({ isFocused: false });
  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false });

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
    const { isModalOpen, isFocused } = this.state;
    const results = this.getFilteredModules(inputValue);
    const showResults = isOpen && results.length > 0;
    const showTip = isFocused && !results.length;
    return (
      <div className={styles.container}>
        <label className="sr-only" {...getLabelProps()}>
          {placeholder}
        </label>
        <input
          autoFocus={isModalOpen}
          className={styles.input}
          {...getInputProps({ placeholder })}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
        {isModalOpen && <CloseButton className={styles.close} onClick={this.closeModal} />}
        {showResults && (
          <ol className={styles.selectList}>
            {results.map((module, index) => {
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
                  {`${module.ModuleCode} ${module.ModuleTitle}`}
                  {module.isAdded && (
                    <div>
                      <span className="badge badge-info">Added</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        {showTip && (
          <div className={styles.tip}>
            Try &quot;GER1000&quot; or &quot;Reasoning&quot;.
            Searching <strong>{this.props.moduleList.length}</strong>{' '}modules.
          </div>
        )}
      </div>
    );
  };

  render() {
    const { isModalOpen } = this.state;
    const { isMatchBreakpoint } = this.props;
    const downshiftComponent = (
      <Downshift
        breakingChanges={DOWNSHIFT_FLAGS}
        selectedItem={''}
        onChange={this.onChange}
        render={this.renderDropdown}
        defaultIsOpen={!isMatchBreakpoint}
      />
    );
    return isMatchBreakpoint ? (
      downshiftComponent
    ) : (
      <div>
        <button className={styles.input} onClick={this.openModal}>
          {this.props.placeholder}
        </button>
        <Modal isOpen={isModalOpen} onRequestClose={this.closeModal} className={styles.modal}>
          {downshiftComponent}
        </Modal>
      </div>
    );
  }
}

export default makeResponsive(ModulesSelect, 'md');
