// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import Downshift from 'downshift';
import classnames from 'classnames';

import type { ModuleSelectList } from 'types/reducers';

import styles from './ModulesSelect.scss';

type Props = {
  moduleList: ModuleSelectList,
  onChange: Function,
  placeholder: string,
};

const downshiftFlags = { resetInputOnSelection: true };

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

    // Match only start of words, case insensitively
    const reg = RegExp(`\\b${inputValue}`, 'i');
    const codeMatches = [];
    const titleMatches = [];

    this.props.moduleList.forEach((mod) => {
      if (reg.test(mod.ModuleCode)) {
        codeMatches.push(mod);
      } else if (reg.test(mod.ModuleTitle)) {
        titleMatches.push(mod);
      }
    });
    return codeMatches.concat(titleMatches).slice(0, 500);
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
          <input className={classnames(styles.input, 'form-control')} {...getInputProps({ placeholder })} />
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
              Try CS1010 or Programming. Searching <strong>{this.props.moduleList.length}</strong> modules.
            </li>
          </ol>
        )}
      </div>
    );
  };

  render() {
    return (
      <Downshift
        breakingChanges={downshiftFlags}
        selectedItem={''}
        onChange={this.onChange}
        render={this.renderModuleSelect}
      />
    );
  }
}

export default ModulesSelect;
