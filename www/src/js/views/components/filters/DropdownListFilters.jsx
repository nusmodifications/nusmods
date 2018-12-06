// @flow

import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';
import { each, values, uniq } from 'lodash';

import type { OnFilterChange } from 'types/views';

import { Search, ChevronDown } from 'views/components/icons';
import makeResponsive from 'views/hocs/makeResponsive';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';
import { highlight } from 'utils/react';
import { breakpointDown, touchScreenOnly } from 'utils/css';
import styles from './styles.scss';
import Checklist from './Checklist';

type Props = {
  onFilterChange: OnFilterChange,
  groups: FilterGroup<any>[],
  group: FilterGroup<*>,
  matchBreakpoint: boolean,
};

type State = {
  isFocused: boolean,
  searchedFilters: string[],
};

export class DropdownListFiltersComponent extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isFocused: false,
      searchedFilters: values(props.group.filters)
        .filter((filter) => filter.enabled)
        .map((filter) => filter.id),
    };
  }

  onSelectItem = (selectedItem: string) => {
    if (!selectedItem) return;

    const { group, onFilterChange } = this.props;
    onFilterChange(group.toggle(selectedItem));
    this.setState({ searchedFilters: uniq([...this.state.searchedFilters, selectedItem]) });
  };

  searchInput = React.createRef<HTMLInputElement>();

  focusInput = () => {
    if (this.searchInput.current) this.searchInput.current.focus();
  };

  displayedFilters(inputValue?: string): [ModuleFilter, number][] {
    const { group, groups } = this.props;
    const moduleCodes = FilterGroup.union(groups, group);

    // Pick out filters that match the search which have at least one matching module
    const filterCount: Map<string, number> = new Map();
    each(group.filters, (filter) => {
      if (inputValue && !filter.label.toLowerCase().includes(inputValue.toLowerCase())) {
        return;
      }

      const count = filter.count(moduleCodes);
      if (count) filterCount.set(filter.id, count);
    });

    // Sort by name in alphabetical order and return together with count
    return Array.from(filterCount.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, count]) => [group.filters[id], count]);
  }

  render() {
    const { group, groups, onFilterChange, matchBreakpoint } = this.props;
    const moduleCodes = FilterGroup.union(groups, group);

    const htmlId = `dropdown-filter-${group.id}`;
    const placeholder = `Add ${group.label.toLowerCase()} filter...`;

    const searchedFilters = this.state.searchedFilters.map((filterId) => group.filters[filterId]);

    return (
      <div className={styles.dropdown}>
        <h4 className={styles.heading}>
          <label htmlFor={htmlId}>{group.label}</label>
        </h4>

        {/* Use a native select for mobile devices */}
        {matchBreakpoint ? (
          <select
            className="form-control"
            id={htmlId}
            onChange={(evt) => {
              this.onSelectItem(evt.target.value);
              // Reset selection to the first placeholder item so that the last selected item
              // is not left selected in the <select>
              evt.target.selectedIndex = 0; // eslint-disable-line no-param-reassign
            }}
          >
            <option>{placeholder}</option>
            {this.displayedFilters().map(([filter, count]) => (
              <option key={filter.id} value={filter.id}>
                {/* Extra layer of interpolation to workaround https://github.com/facebook/react/issues/11911 */}
                {/* Use a unicode checkbox to indicate to the user filters that are already enabled */}
                {filter.enabled ? `☑ ${filter.label} (${count})` : `${filter.label} (${count})`}
              </option>
            ))}
          </select>
        ) : (
          /* Use a search-select combo dropdown on desktop */
          <Downshift
            onChange={(selectedItem, { clearSelection }) => {
              this.onSelectItem(selectedItem);
              clearSelection();
            }}
          >
            {({
              getInputProps,
              getItemProps,
              openMenu,
              isOpen,
              inputValue,
              highlightedIndex,
              getMenuProps,
            }) => (
              <div className="dropdown" {...getMenuProps()}>
                <div
                  className={classnames(styles.searchWrapper, {
                    [styles.focused]: this.state.isFocused,
                  })}
                >
                  <Search className={styles.searchIcon} onClick={this.focusInput} />
                  <input
                    ref={this.searchInput}
                    {...getInputProps({
                      onFocus: () => {
                        this.setState({ isFocused: true });
                        openMenu();
                      },
                      onBlur: () => this.setState({ isFocused: false }),
                      className: classnames('form-control form-control-sm', styles.searchInput),
                      placeholder,
                      id: htmlId,
                    })}
                  />
                  <ChevronDown className={styles.openIcon} onClick={openMenu} />
                </div>

                {isOpen && (
                  <div className="dropdown-menu show">
                    {this.displayedFilters(inputValue).map(([filter, count], index) => {
                      const id = `${group.id}-${filter.id}`;
                      return (
                        <div
                          key={filter.id}
                          {...getItemProps({
                            item: filter.id,
                            className: classnames('dropdown-item form-check', {
                              'dropdown-selected': index === highlightedIndex,
                              [styles.enabled]: filter.enabled,
                            }),
                          })}
                        >
                          <input
                            id={id}
                            className="form-check-input"
                            type="checkbox"
                            defaultChecked={filter.enabled}
                          />
                          <label
                            htmlFor={id}
                            className={classnames('form-check-label', styles.label)}
                          >
                            {highlight(filter.label, inputValue)}
                            &nbsp;
                            <span className="text-muted">({count})</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Downshift>
        )}

        {/* Show all filters that have been selected at some point */}
        <Checklist
          groupId={`${group.id}-selected`}
          filters={searchedFilters}
          onChange={(filter) => onFilterChange(group.toggle(filter))}
          getCount={(filter) => filter.count(moduleCodes)}
        />
      </div>
    );
  }
}

export default makeResponsive(DropdownListFiltersComponent, [
  breakpointDown('sm'),
  touchScreenOnly(),
]);
