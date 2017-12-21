// @flow
import React, { Component } from 'react';
import noScroll from 'no-scroll';
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
  isOpen: boolean,
};

const RESULTS_LIMIT = 500;

class ModulesSelect extends Component<Props, State> {
  input: ?HTMLInputElement;
  state = {
    isOpen: false,
    isModalOpen: false,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      !_.isEqual(this.state, nextState) ||
      this.props.isMatchBreakpoint !== nextProps.isMatchBreakpoint ||
      _.size(this.props.moduleList) !== _.size(nextProps.moduleList)
    );
  }

  onChange = (selection: any) => {
    // Refocus after choosing a module
    if (this.input) this.input.focus();
    if (selection) this.props.onChange(selection);
  };

  onFocus = () => this.setState({ isOpen: true });
  onOuterClick = () => this.setState({ isOpen: false });
  toggleModal = () => {
    noScroll.toggle();
    this.setState({ isModalOpen: !this.state.isModalOpen });
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
          onFocus={this.onFocus}
        />
        {isModalOpen && <CloseButton className={styles.close} onClick={this.toggleModal} />}
        {showResults && (
          <ol className={styles.selectList}>
            {results.map((module, index) => {
              return module.isAdded ? (
                <li key={module.ModuleCode} className={classnames(styles.option, styles.optionDisabled)}>
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
              );
            })}
          </ol>
        )}
        {showTip && (
          <div className={styles.tip}>
            Try &quot;GER1000&quot; or &quot;Quantative Reasoning&quot;. Searching{' '}
            <strong>{this.props.moduleList.length}</strong> modules.
          </div>
        )}
      </div>
    );
  };

  render() {
    const { isModalOpen, isOpen } = this.state;
    const { isMatchBreakpoint } = this.props;
    const downshiftComponent = (
      <Downshift
        isOpen={isModalOpen || isOpen}
        onOuterClick={this.onOuterClick}
        onChange={this.onChange}
        render={this.renderDropdown}
        /* Hack to force item selection to be empty */
        itemToString={_.stubString}
        selectedItem={''}
      />
    );
    return isMatchBreakpoint ? (
      downshiftComponent
    ) : (
      <div>
        <button className={styles.input} onClick={this.toggleModal}>
          {this.props.placeholder}
        </button>
        <Modal isOpen={isModalOpen} onRequestClose={this.toggleModal} className={styles.modal}>
          {downshiftComponent}
        </Modal>
      </div>
    );
  }
}

export default makeResponsive(ModulesSelect, 'md');
