// @flow
import React, { Component } from 'react';
import { has } from 'lodash';
import Downshift, { type ChildrenFunction } from 'downshift';
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
  getFilteredModules: (?string) => ModuleSelectList,
  onChange: (ModuleCode) => void,
  moduleCount: number,
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

class ModulesSelect extends Component<Props, State> {
  state = {
    isOpen: false,
    isModalOpen: false,
    inputValue: '',
    selectedItem: null,
  };

  onStateChange = (changes: any) => {
    if (has(changes, 'selectedItem')) {
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

  onKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.closeSelect();
      event.target.blur();
    }
  };

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
      isModalOpen: !this.props.matchBreakpoint,
    });
  };

  // downshift attaches label for us; autofocus only applies to modal
  /* eslint-disable jsx-a11y/label-has-for, jsx-a11y/no-autofocus */
  renderDropdown: ChildrenFunction<string> = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    isOpen,
    inputValue,
    highlightedIndex,
  }) => {
    const { placeholder, disabled } = this.props;
    const { isModalOpen } = this.state;
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
            placeholder,
            disabled,
            onFocus: this.onFocus,
            onBlur: this.onBlur,
            onChange: this.onInputChange,
            onKeyDown: this.onKeyDown,
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
                    {/* Using interpolated string instead of JSX because of iOS Safari
                        bug that drops the whitespace between the module code and title */}
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
                    {/* Using interpolated string instead of JSX because of iOS Safari
                        bug that drops the whitespace between the module code and title */}
                    {`${module.ModuleCode} ${module.ModuleTitle}`}
                  </li>
                ),
            )}
          </ol>
        )}
        {showTip && (
          <div className={styles.tip}>
            Try &quot;GER1000&quot; or &quot;Quantitative Reasoning&quot;. Searching{' '}
            <strong>{this.props.moduleCount}</strong> modules.
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
        onStateChange={this.onStateChange}
        inputValue={this.state.inputValue}
        isOpen={this.state.isOpen}
        selectedItem={this.state.selectedItem}
        defaultHighlightedIndex={0}
      >
        {this.renderDropdown}
      </Downshift>
    );

    if (matchBreakpoint) {
      return downshiftComponent;
    }

    return (
      <div>
        <button
          className={classnames(styles.input, elements.addModuleInput)}
          onClick={this.openSelect}
          disabled={disabled}
        >
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
