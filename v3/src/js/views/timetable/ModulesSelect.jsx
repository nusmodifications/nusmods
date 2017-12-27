// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import type { ModuleSelectList } from 'types/reducers';
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
  isModalOpen: boolean,
  isOpen: boolean,
};

const RESULTS_LIMIT = 500;

class ModulesSelect extends Component<Props, State> {
  input: ?HTMLInputElement;
  state = {
    isOpen: false,
    isModalOpen: false,
  };

  onChange = (selection: any) => {
    // Refocus after choosing a module
    if (this.input) this.input.focus();
    if (selection) this.props.onChange(selection);
  };

  onFocus = () => this.setState({ isOpen: true });
  onOuterClick = () => this.setState({ isOpen: false });
  toggleModal = () => this.setState({ isModalOpen: !this.state.isModalOpen });

  getFilteredModules = (inputValue: string) => {
    if (!inputValue) {
      return [];
    }

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
    const showTip = isModalOpen ? !results.length : isOpen && !results.length;
    return (
      <div className={styles.container}>
        <label className="sr-only" {...getLabelProps()}>
          {placeholder}
        </label>
        <input
          ref={(input) => {
            this.input = input;
          }}
          autoFocus={isModalOpen}
          className={styles.input}
          {...getInputProps({ placeholder })}
          disabled={disabled}
          onFocus={this.onFocus}
          /* Also prevents iOS "Done" button from resetting input */
          onBlur={() => {
            if (!inputValue && isModalOpen) this.toggleModal();
          }}
        />
        {isModalOpen && <CloseButton className={styles.close} onClick={this.toggleModal} />}
        {showResults && (
          <ol className={styles.selectList}>
            {results.map(
              (module, index) =>
                module.isAdded ? (
                  <li
                    key={module.ModuleCode}
                    className={classnames(styles.option, styles.optionDisabled, {
                      [styles.optionSelected]: highlightedIndex === index,
                    })}>
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
                    })}>
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
      </div>
    );
  };

  render() {
    const { isModalOpen, isOpen } = this.state;
    const { matchBreakpoint, disabled } = this.props;
    const downshiftComponent = (
      <Downshift
        isOpen={isModalOpen || isOpen}
        onOuterClick={this.onOuterClick}
        onChange={this.onChange}
        render={this.renderDropdown}
        /* Hack to force item selection to be empty */
        itemToString={_.stubString}
        selectedItem=""
      />
    );
    return matchBreakpoint ? (
      downshiftComponent
    ) : (
      <div>
        <button className={styles.input} onClick={this.toggleModal} disabled={disabled}>
          {this.props.placeholder}
        </button>
        <Modal
          isOpen={!disabled && isModalOpen}
          onRequestClose={this.toggleModal}
          className={styles.modal}>
          {downshiftComponent}
        </Modal>
      </div>
    );
  }
}

export default makeResponsive(ModulesSelect, breakpointUp('md'));
