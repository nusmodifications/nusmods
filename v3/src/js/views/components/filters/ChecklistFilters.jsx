// @flow
import React from 'react';
import { values } from 'lodash';
import type { Module } from 'types/modules';
import type { OnFilterChange } from 'types/views';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';

type Props = {
  onFilterChange: OnFilterChange,
  group: FilterGroup<*>,
  modules: Array<Module>,
};

export default function ChecklistFilters(props: Props) {
  const { group, modules, onFilterChange } = props;

  return (
    <div>
      <h4>{ group.label }</h4>
      <ul className="list-unstyled">
        {values(group.filters).map((filter: ModuleFilter) => (
          <li key={filter.label}>
            <label className="form-check-label">
              <input
                className="form-check-input"
                type="checkbox"
                checked={filter.enabled}
                onChange={() => onFilterChange(group.toggle(filter.label))}
              />
              {filter.label} <span className="text-muted">({filter.count(modules)})</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
