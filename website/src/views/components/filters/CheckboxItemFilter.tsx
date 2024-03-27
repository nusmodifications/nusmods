import * as React from 'react';
import { CheckboxFilterAccessor, SearchkitComponent, SearchkitComponentProps } from 'searchkit';

import { ElasticSearchFilter } from 'types/vendor/elastic-search';
import CheckboxItem from './CheckboxItem';

interface CheckboxItemFilterProps extends SearchkitComponentProps {
  id: string;
  label: string;
  filter: ElasticSearchFilter;
  showCount: boolean;
  disabled: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type State = {};

/**
 * SearchKit's default CheckboxFilter comes with an unnecessary title and is hard to customize.
 * This creates a single item checkbox that can then be embedded in a list such that each item
 * implements their own filter.
 *
 * Note that this is less efficient than RefinementListFilter, so that should be used if the
 * queried items are distinct and mutually exclusive.
 */
export default class CheckboxItemFilter extends SearchkitComponent<CheckboxItemFilterProps, State> {
  declare accessor: CheckboxFilterAccessor;

  static defaultProps = {
    showCount: true,
    disabled: false,
  };

  override defineAccessor() {
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
    this.accessor.state = this.accessor.state.setValue(checked);
    this.searchkit.performSearch();
  };

  override render() {
    // this.accessor's types are lying. It is in fact optional, but we can't make it that
    // because that would conflict with the parent class's types. Setting this.accessor
    // directly to defineAccessor() also does not work since SearchKit appears to only
    // be initialized in didMount. This terrible pattern is also repeated in SearchKit's
    // own components, so I guess we'll just have to live with this.
    if (!this.accessor) return null;

    const { id, label, showCount, disabled } = this.props;

    return (
      <CheckboxItem
        onClick={this.setFilters}
        active={Boolean(this.accessor.state.getValue())}
        itemKey={id}
        label={label}
        count={this.accessor.getDocCount()}
        showCount={showCount}
        disabled={disabled}
      />
    );
  }
}
