// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import type { ModuleSelectList } from 'types/reducers';
import type { ModuleCode } from 'types/modules';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import { breakpointUp } from 'utils/css';
import makeResponsive from 'views/hocs/makeResponsive';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';

import styles from './ModulesSelect.scss';

type Props = {
  moduleList: ModuleSelectList,
  onChange: Function,
  placeholder: string,
  matchBreakpoint: boolean,
  disabled?: boolean,
};

type State = {
  isOpen: boolean,
  isModalOpen: boolean,
  inputValue: string,
  selectedItem: ?ModuleCode,
};

const RESULTS_LIMIT = 500;

class ModulesSelect extends Component<Props, State> {
  state = {
    isOpen: false,
    isModalOpen: false,
    inputValue: '',
    selectedItem: null,
  };

  onStateChange = (changes: any) => {
    if (_.has(changes, 'selectedItem')) {
      this.props.onChange(changes.selectedItem);
    }
  };

  onBlur = () => {
    if (!this.state.inputValue && this.state.isModalOpen) {
      this.closeSelect();
    }
  };

  onInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  onFocus = () => this.openSelect();
  onOuterClick = () => this.closeSelect();

  closeSelect = () => {
    this.setState({
      isOpen: false,
      isModalOpen: false,
      inputValue: '',
      selectedItem: null,
    });
  };

  openSelect = () => {
    this.setState({
      isOpen: true,
      isModalOpen: true,
    });
  };

  getFilteredModules = (inputValue: string) => {
    if (!inputValue) return [];
    const predicate = createSearchPredicate(inputValue);
    const results = this.props.moduleList.filter(predicate);
    return sortModules(inputValue, results.slice(0, RESULTS_LIMIT));
  };

  // downshift attaches label for us; autofocus only applies to modal
  /* eslint-disable jsx-a11y/label-has-for, jsx-a11y/no-autofocus */
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderDropdown = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    isOpen,
    inputValue,
    highlightedIndex,
  }: any) => {
    const { placeholder, disabled } = this.props;
    const { isModalOpen } = this.state;
    const results = this.getFilteredModules(inputValue);
    const showResults = isOpen && results.length > 0;
    const showTip = isModalOpen && !results.length;
    const showNoResultMessage = isOpen && inputValue && !results.length;

    return (
      <div className={styles.container}>
        <label className="sr-only" {...getLabelProps()}>
          {placeholder}
        </label>
        <input
          {...getInputProps({
            className: styles.input,
            autoFocus: isModalOpen,
            placeholder,
            disabled,
            onFocus: this.onFocus,
            onBlur: this.onBlur,
            onChange: this.onInputChange,
          })}
        />
        {showResults && (
          <ol className={styles.selectList}>
            {results.map(
              (module, index) =>
                module.isAdded ? (
                  <li
                    key={module.ModuleCode}
                    className={classnames(styles.option, styles.optionDisabled, {
                      [styles.optionSelected]: highlightedIndex === index,
                    })}
                  >
                    {`${module.ModuleCode} ${module.ModuleTitle}`}
                    <div>
                      <span className="badge badge-info">Added</span>
                    </div>
                  </li>
                ) : (
                  <li
                    {...getItemProps({
                      key: module.ModuleCode,
                      item: module.ModuleCode,
                      index,
                    })}
                    className={classnames(styles.option, {
                      [styles.optionSelected]: highlightedIndex === index,
                    })}
                  >
                    {`${module.ModuleCode} ${module.ModuleTitle}`}
                  </li>
                ),
            )}
          </ol>
        )}
        {showTip && (
          <div className={styles.tip}>
            Try &quot;GER1000&quot; or &quot;Quantitative Reasoning&quot;. Searching{' '}
            <strong>{this.props.moduleList.length}</strong> modules.
          </div>
        )}
        {showNoResultMessage && (
          <div className={styles.tip}>
            No modules found for <strong>&quot;{inputValue}&quot;</strong>.
          </div>
        )}
      </div>
    );
  };

  render() {
    const { isModalOpen } = this.state;
    const { matchBreakpoint, disabled } = this.props;

    const downshiftComponent = (
      <Downshift
        onOuterClick={this.onOuterClick}
        render={this.renderDropdown}
        onStateChange={this.onStateChange}
        inputValue={this.state.inputValue}
        isOpen={this.state.isOpen}
        selectedItem={this.state.selectedItem}
      />
    );

    if (matchBreakpoint) {
      return downshiftComponent;
    }

    return (
      <div>
        <button className={styles.input} onClick={this.openSelect} disabled={disabled}>
          {this.props.placeholder}
        </button>
        <Modal
          isOpen={!disabled && isModalOpen}
          onRequestClose={this.closeSelect}
          className={styles.modal}
        >
          <CloseButton className={styles.close} onClick={this.closeSelect} />
          {downshiftComponent}
        </Modal>
      </div>
    );
  }
}

export default makeResponsive(ModulesSelect, breakpointUp('md'));
