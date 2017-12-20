// @flow

import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';
import { values, uniq } from 'lodash';

import type { OnFilterChange } from 'types/views';

import { Search } from 'views/components/icons';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';
import { highlight } from 'utils/react';
import styles from './styles.scss';

type Props = {
  onFilterChange: OnFilterChange,
  groups: FilterGroup<any>[],
  group: FilterGroup<*>,
};

type State = {
  searchedFilters: string[],
}

export default class DropdownListFilters extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      searchedFilters: values(props.group.filters)
        .filter(filter => filter.enabled)
        .map(filter => filter.id),
    };
  }

  onChange = (selectedItem: string, { clearSelection }: Object) => {
    const { group, onFilterChange } = this.props;
    onFilterChange(group.toggle(selectedItem));
    this.setState({ searchedFilters: uniq([...this.state.searchedFilters, selectedItem]) });
    clearSelection();
  };

  displayedFilters(inputValue: string) {
    return values(this.props.group.filters)
      .filter(filter => filter.label.toLowerCase().includes(inputValue.toLowerCase()));
  }

  render() {
    const { group, groups, onFilterChange } = this.props;
    const moduleCodes = FilterGroup.union(groups, group);

    return (
      <div className={styles.dropdown}>
        <h4 className={styles.heading}>{group.label}</h4>

        <Downshift
          breakingChanges={{ resetInputOnSelection: true }}
          onChange={this.onChange}
          render={({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex,
          }) => (
            <div className="dropdown">
              <div className={styles.searchWrapper}>
                <Search />
                <input
                  {...getInputProps({
                    className: classnames('form-control form-control-sm', styles.searchInput),
                    placeholder: `Search ${group.label.toLowerCase()}...`,
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
