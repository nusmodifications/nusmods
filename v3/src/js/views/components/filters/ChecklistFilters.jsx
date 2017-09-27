// @flow
import React from 'react';
import classnames from 'classnames';
import { values } from 'lodash';

import type { OnFilterChange } from 'types/views';

import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';

type Props = {
  onFilterChange: OnFilterChange,
  groups: FilterGroup<any>[],
  group: FilterGroup<*>,
};

export default function ChecklistFilters(props: Props) {
  const { group, groups, onFilterChange } = props;
  const moduleCodes = FilterGroup.union(groups, group);

  return (
    <div className="module-filters-checklist">
      <h4>{group.label}</h4>
      <ul className="list-unstyled">
        {values(group.filters).map((filter: ModuleFilter) => (
          <li key={filter.label}>
            <label className={classnames('form-check-label', { 'filter-selected': filter.enabled })}>
              <input
                className="form-check-input"
                type="checkbox"
                checked={filter.enabled}
                onChange={() => onFilterChange(group.toggle(filter))}
              />
              {filter.label} <span className="text-muted">({filter.count(moduleCodes)})</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
