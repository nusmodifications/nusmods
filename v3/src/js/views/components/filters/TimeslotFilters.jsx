// @flow

import React from 'react';
import classnames from 'classnames';
import TimeslotTable from 'views/components/module-info/TimeslotTable';
import TimeslotFilter, { labelToId } from 'utils/filters/TimeslotFilter';
import FilterGroup from 'utils/filters/FilterGroup';
import { Timeslots } from 'types/modules';
import type { OnFilterChange } from 'types/views';
import type { Module } from 'types/modules';
import { getTimeslot } from '../../../utils/modules';

type Props = {
  onFilterChange: OnFilterChange,
  group: FilterGroup<TimeslotFilter>,
  modules: Module[],
};

export default function TimeslotFilters(props: Props) {
  const { group, modules, onFilterChange } = props;

  const children = new Map();
  Timeslots.forEach(([day, time]) => {
    const timeslot = getTimeslot(day, time);
    const filter = group.filters[labelToId(timeslot)];
    const count = filter.count(modules);

    children.set(timeslot,
      <label
        className={classnames({ 'filter-selected': filter.enabled })}
        title={`${count} modules with lessons on ${timeslot}`}
      >
        <span className="sr-only">{ timeslot }</span>
        <span>{ count }</span>
        <input
          className="sr-only"
          type="checkbox"
          checked={filter.enabled}
          onChange={() => onFilterChange(group.toggle(filter))}
        />
      </label>);
  });

  return (
    <div className="module-filters-timeslot">
      <h4>{group.label}</h4>
      <TimeslotTable>{children}</TimeslotTable>
    </div>
  );
}
