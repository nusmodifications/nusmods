// @flow
import React, { Component } from 'react';
import { has, omit } from 'lodash';
import type { ChildrenFunction, DownshiftState, StateChangeOptions } from 'downshift';
import Downshift from 'downshift';
import classnames from 'classnames';

import type { ModuleSelectList } from 'types/reducers';
import type { ModuleCode } from 'types/modules';

import { breakpointUp } from 'utils/css';
import makeResponsive from 'views/hocs/makeResponsive';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import elements from 'views/elements';

import styles from './ModulesSelect.scss';

type Props = {
  moduleCount: number,
  placeholder: string,
  matchBreakpoint: boolean,
  disabled?: boolean,

  getFilteredModules: (?string) => ModuleSelectList,
  onChange: (ModuleCode) => void,
};

type State = {
  isOpen: boolean,
  inputValue: string,
};

export class ModulesSelectComponent extends Component<Props, State> {
  state = {
    isOpen: false,
    inputValue: '',
  };

  // This component does not use the usual onChange and onInputChange helper
  // props because we don't want to trigger some of the default
  onStateChange = (changes: StateChangeOptions<ModuleCode>) => {
    if (has(changes, 'selectedItem')) {
      this.props.onChange(changes.selectedItem);
    } else if (
      has(changes, 'inputValue') &&
      changes.type !== Downshift.stateChangeTypes.blurInput
    ) {
      // This allows us to retain input value when an element is selected
      this.setState({ inputValue: changes.inputValue });
    }
  };

  onOuterClick = () =>
    this.setState({
      isOpen: false,
      inputValue: this.state.inputValue,
    });

  closeSelect = () =>
    this.setState({
      isOpen: false,
      inputValue: '',
    });

  openSelect = () =>
    this.setState({
      isOpen: true,
    });

  stateReducer = (state: DownshiftState<ModuleCode>, changes: StateChangeOptions<ModuleCode>) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.blurInput:
        if (state.inputValue) {
          return {}; // remain open on iOS
        }
        this.closeSelect();
        return changes;

      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        // Don't reset highlighted index back to 0 when an item is selected
        return {
          ...changes,
          highlightedIndex: state.highlightedIndex,
        };

      case Downshift.stateChangeTypes.mouseUp:
        // Don't clear input on blur
        return omit(changes, 'inputValue');

      default:
        return changes;
    }
  };

  // downshift attaches label for us; autofocus only applies to modal
  /* eslint-disable jsx-a11y/label-has-for, jsx-a11y/no-autofocus */
  renderDropdown: ChildrenFunction<ModuleCode> = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    isOpen,
    inputValue,
    highlightedIndex,
  }) => {
    const { placeholder, disabled, moduleCount } = this.props;
    const isModalOpen = !this.props.matchBreakpoint && isOpen;
    const results = this.props.getFilteredModules(inputValue);
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
            className: classnames(styles.input, elements.addModuleInput),
            autoFocus: isModalOpen,
            disabled,
            placeholder,
            // no onBlur as that means people can't click menu items as
            // input has lost focus, see 'onOuterClick' instead
            onFocus: this.openSelect,
          })}
        />
        {isModalOpen && <CloseButton className={styles.close} onClick={this.closeSelect} />}
        {showResults && (
          <ol className={styles.selectList} {...getMenuProps()}>
            {results.map((module, index) => (
              <li
                {...getItemProps({
                  index,
                  key: module.ModuleCode,
                  item: module.ModuleCode,
                  disabled: module.isAdded || module.isAdding,
                })}
                className={classnames(styles.option, {
                  [styles.optionDisabled]: module.isAdded || module.isAdding,
                  [styles.optionSelected]: highlightedIndex === index,
                })}
              >
                {/* Using interpolated string instead of JSX because of iOS Safari
                    bug that drops the whitespace between the module code and title */}
                {`${module.ModuleCode} ${module.ModuleTitle}`}
                {module.isAdded && (
                  <div>
                    <span className="badge badge-info">Added</span>
                  </div>
                )}
                {module.isAdding && (
                  <div>
                    <span className="badge badge-warning">Adding...</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        {showTip && (
          <div className={styles.tip}>
            Try &quot;GER1000&quot; or &quot;Quantitative Reasoning&quot;. Searching{' '}
            <strong>{moduleCount}</strong> modules.
          </div>
        )}
        {showNoResultMessage && (
          <div className={styles.tip}>
            No modules found for{' '}
            <strong>
              &quot;
              {inputValue}
              &quot;
            </strong>
            .
          </div>
        )}
      </div>
    );
  };

  render() {
    const { isOpen } = this.state;
    const { matchBreakpoint, disabled } = this.props;

    const downshiftComponent = (
      <Downshift
        isOpen={isOpen}
        onOuterClick={this.onOuterClick}
        onStateChange={this.onStateChange}
        inputValue={this.state.inputValue}
        selectedItem={null}
        stateReducer={this.stateReducer}
        defaultHighlightedIndex={0}
      >
        {this.renderDropdown}
      </Downshift>
    );

    if (matchBreakpoint) {
      return downshiftComponent;
    }

    return (
      <React.Fragment>
        <button
          className={classnames(styles.input, elements.addModuleInput)}
          onClick={this.openSelect}
          disabled={disabled}
        >
          {this.props.placeholder}
        </button>
        <Modal
          isOpen={!disabled && isOpen}
          onRequestClose={this.closeSelect}
          className={styles.modal}
          shouldCloseOnOverlayClick={false}
          fullscreen
        >
          {downshiftComponent}
        </Modal>
      </React.Fragment>
    );
  }
}

export default makeResponsive(ModulesSelectComponent, breakpointUp('md'));
