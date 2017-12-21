// @flow

import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';
import { values, uniq, map } from 'lodash';

import type { OnFilterChange } from 'types/views';

import { Search } from 'views/components/icons';
import makeResponsive from 'views/hocs/makeResponsive';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';
import { highlight } from 'utils/react';
import styles from './styles.scss';

type Props = {
  onFilterChange: OnFilterChange,
  groups: FilterGroup<any>[],
  group: FilterGroup<*>,
  matchBreakpoint: boolean,
};

type State = {
  isFocused: boolean,
  searchedFilters: string[],
}

export class DropdownListFiltersComponent extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isFocused: false,
      searchedFilters: values(props.group.filters)
        .filter(filter => filter.enabled)
        .map(filter => filter.id),
    };
  }

  onSelectItem(selectedItem: string) {
    const { group, onFilterChange } = this.props;
    onFilterChange(group.toggle(selectedItem));
    this.setState({ searchedFilters: uniq([...this.state.searchedFilters, selectedItem]) });
  }

  onChange = (selectedItem: string, { clearSelection }: Object) => {
    this.onSelectItem(selectedItem);
    clearSelection();
  };

  displayedFilters(inputValue: string) {
    return values(this.props.group.filters)
      .filter(filter => filter.label.toLowerCase().includes(inputValue.toLowerCase()));
  }

  render() {
    const { group, groups, onFilterChange, matchBreakpoint } = this.props;
    const moduleCodes = FilterGroup.union(groups, group);
    const htmlId = `dropdown-filter-${group.id}`;

    return (
      <div className={styles.dropdown}>
        <h4 className={styles.heading}>
          <label htmlFor={htmlId}>{group.label}</label>
        </h4>

        {matchBreakpoint ?
          <Downshift
            breakingChanges={{ resetInputOnSelection: true }}
            onChange={this.onChange}
            render={({
              getInputProps,
              getItemProps,
              openMenu,
              isOpen,
              inputValue,
              highlightedIndex,
            }) => (
              <div className="dropdown">
                <div className={classnames(styles.searchWrapper, { [styles.focused]: this.state.isFocused })}>
                  <Search />
                  <input
                    {...getInputProps({
                      onFocus: () => {
                        this.setState({ isFocused: true });
                        openMenu();
                      },
                      onBlur: () => this.setState({ isFocused: false }),
                      className: classnames('form-control form-control-sm', styles.searchInput),
                      placeholder: `Search ${group.label.toLowerCase()}...`,
                      id: htmlId,
                    })}
                  />
                </div>

                {isOpen &&
                <div className="dropdown-menu show">
                  {this.displayedFilters(inputValue)
                    .map((filter: ModuleFilter, index: number) => (
                      <label
                        key={filter.id}
                        {...getItemProps({
                          item: filter.id,
                          className: classnames('dropdown-item', styles.label, {
                            [styles.selected]: index === highlightedIndex,
                            [styles.enabled]: filter.enabled,
                          }),
                        })}
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultChecked={filter.enabled}
                        />
                        {highlight(filter.label, inputValue)}
                        &nbsp;
                        <span className="text-muted">({filter.count(moduleCodes)})</span>
                      </label>
                    ))}
                </div>}
              </div>
            )}
          />
          :
          <select
            className="form-control"
            onChange={evt => this.onSelectItem(evt.target.value)}
          >
            {map(group.filters, filter => (
              <option key={filter.id} value={filter.id}>
                {filter.label} ({filter.count(moduleCodes)})
              </option>
            ))}
          </select>}

        <ul className="list-unstyled">
          {this.state.searchedFilters.map((filterId) => {
            const filter = group.filters[filterId];
            if (!filter) return null;

            return (
              <li key={filter.id}>
                <label
                  className={classnames(
                    'form-check-label',
                    styles.label,
                    { [styles.enabled]: filter.enabled },
                  )}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={filter.enabled}
                    onChange={() => onFilterChange(group.toggle(filter))}
                  />
                  {filter.label}&nbsp;<span className="text-muted">({filter.count(moduleCodes)})</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default makeResponsive(DropdownListFiltersComponent, 'md');
