import React from 'react';
import { CheckboxFilterAccessor, SearchkitComponent, SearchkitComponentProps } from 'searchkit';

import CheckboxItem from './CheckboxItem';

interface CheckboxItemFilterProps extends SearchkitComponentProps {
  id: string;
  label: string;
  filter: any;
  showCount: boolean;
  disabled: boolean;
}

type State = {
  checked: boolean;
};

/**
 * SearchKit's default CheckboxFilter comes with an unnecessary title and is hard to customize.
 * This creates a single item checkbox that can then be embedded in a list such that each item
 * implements their own filter.
 *
 * Note that this is less efficient than RefinementListFilter, so that should be used if the
 * queried items are distinct and mutually exclusive.
 */
export default class CheckboxItemFilter extends SearchkitComponent<CheckboxItemFilterProps, State> {
  accessor!: CheckboxFilterAccessor;

  state: State = {
    checked: false,
  };

  static defaultProps = {
    showCount: true,
    disabled: false,
  };

  defineAccessor() {
    const { id, translations, label, filter } = this.props;
    return new CheckboxFilterAccessor(id, {
      id,
      label,
      translations,
      filter,
    });
  }

  setFilters: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    const { checked } = evt.target;
    this.setState({ checked });
    this.accessor.state = this.accessor.state.setValue(checked);
    this.searchkit.performSearch();
  };

  render() {
    const { id, label, showCount, disabled } = this.props;

    return (
      <CheckboxItem
        onClick={this.setFilters}
        itemKey={id}
        label={label}
        count={this.accessor.getDocCount()}
        showCount={showCount}
        disabled={disabled}
      />
    );
  }
}
