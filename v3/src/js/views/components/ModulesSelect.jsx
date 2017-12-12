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

class ModulesSelect extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return _.size(this.props.moduleList) !== _.size(nextProps.moduleList);
  }

  getFilteredModules = (inputValue: string) => {
    if (inputValue === '') {
      return [];
    }

    const reg = RegExp(`\\b${inputValue}`, 'i');
    const codeMatches = [];
    const titleMatches = [];

    this.props.moduleList.forEach((mod) => {
      const index = mod.label.search(reg);
      if (index >= 6) {
        titleMatches.push(mod);
      } else if (index >= 0) {
        codeMatches.push(mod);
      }
    });
    return codeMatches.concat(titleMatches);
  };

  render() {
    return (
      <Downshift onSelect={this.props.onChange}>
        {({ getLabelProps, getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
          <div className={styles.container}>
            <label htmlFor="search" className="sr-only" {...getLabelProps()}>
              Languages
            </label>
            <input
              id="search"
              className={classnames(styles.input, 'form-control')}
              {...getInputProps({
                placeholder: 'Add a module',
              })}
            />
            {isOpen && (
              <ol className={styles.selectList}>
                {this.getFilteredModules(inputValue).map((module, index) => {
                  return (
                    <li
                      {...getItemProps({
                        key: module.value,
                        item: module.value,
                        index,
                      })}
                    >
                      <button
                        className={classnames('btn', styles.option, {
                          [styles.optionSelected]: highlightedIndex === index,
                        })}
                      >
                        {module.label}
                      </button>
                    </li>
                  );
                })}
                <li className={styles.defaultPanel}>
                  Try CS1010 or Programming. Searching <strong>{this.props.moduleList.length}</strong> modules.
                </li>
              </ol>
            )}
          </div>
        )}
      </Downshift>
    );
  }
}

export default ModulesSelect;
