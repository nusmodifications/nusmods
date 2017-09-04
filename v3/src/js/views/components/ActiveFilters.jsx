// @flow

import React from 'react';
import _ from 'lodash';

import type { OnFilterChange } from 'types/views';
import type { FilterGroupId } from 'utils/filters/FilterGroup';
import FilterGroup from 'utils/filters/FilterGroup';

type Props = {
  filterGroups: { [FilterGroupId]: FilterGroup<any> },
  onFilterChange: OnFilterChange,
};

export default function (props: Props) {
  const { onFilterChange, filterGroups } = props;

  const activeFilters: FilterGroup<any>[] = _.values(filterGroups)
    .filter(group => group.activeFilters.length);

  if (!activeFilters.length) return null;

  return (
    <div className="module-filters-active">
      <h3><span>Active filters</span></h3>

      <ul className="list-unstyled">
        {activeFilters.map(group => (
          <li key={group.id}>
            <h4>{group.label}</h4>
            {group.activeFilters.map(filter => (
              <button
                key={filter.id}
                className="btn btn-outline-primary btn-sm"
                onClick={() => onFilterChange(group.toggle(filter, false))}
              >
                { filter.label } <b>&times;</b>
              </button>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
