// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import { createSearchPredicate, sortModules } from 'utils/moduleSearch';

import type { ModuleSelectList } from 'types/reducers';

import styles from './ModulesSelect.scss';

type Props = {
  moduleList: ModuleSelectList,
  onChange: Function,
  placeholder: string,
};

const RESULTS_LIMIT = 500;
const DOWNSHIFT_FLAGS = { resetInputOnSelection: true };

class ModulesSelect extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return _.size(this.props.moduleList) !== _.size(nextProps.moduleList);
  }

  onChange = (selection: any) => {
    return selection && this.props.onChange(selection);
  };

  getFilteredModules = (inputValue: string) => {
    if (!inputValue) {
      return [];
    }

    const predicate = createSearchPredicate(inputValue);
    const results = this.props.moduleList.filter(predicate);

    return sortModules(inputValue, results.slice(0, RESULTS_LIMIT));
  };

  /* eslint-disable jsx-a11y/label-has-for */
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderModuleSelect = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    isOpen,
    inputValue,
    clearSelection,
    highlightedIndex,
  }: any) => {
    const { placeholder } = this.props;
    return (
      <div className={classnames(styles.container, { [styles.isOpen]: isOpen })}>
        <div className={styles.container}>
          <label className="sr-only" {...getLabelProps()}>
            {placeholder}
          </label>
          <input className={styles.input} {...getInputProps({ placeholder })} />
          {inputValue && (
            <button className={styles.close} onClick={clearSelection} aria-label="clear selection">
              &times;
            </button>
          )}
        </div>
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
                    <div>
                      <span className="badge badge-info">Added</span>
                    </div>
                  )}
                </li>
              );
            })}
            <li className={styles.item}>
              Try &quot;CS1010&quot; or &quot;Programming&quot;. Searching{' '}
              <strong>{this.props.moduleList.length}</strong> modules.
            </li>
          </ol>
        )}
      </div>
    );
  };

  render() {
    return (
      <Downshift
        breakingChanges={DOWNSHIFT_FLAGS}
        selectedItem={''}
        onChange={this.onChange}
        render={this.renderModuleSelect}
      />
    );
  }
}

export default ModulesSelect;
