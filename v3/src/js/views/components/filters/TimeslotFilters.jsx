// @flow

import React from 'react';
import classnames from 'classnames';

import type { OnFilterChange } from 'types/views';

import TimeslotTable from 'views/components/module-info/TimeslotTable';
import TimeslotFilter from 'utils/filters/TimeslotFilter';
import FilterGroup from 'utils/filters/FilterGroup';
import { getTimeslot } from 'utils/modules';
import { Timeslots } from 'types/modules';
import styles from './styles.scss';

type Props = {
  onFilterChange: OnFilterChange,
  group: FilterGroup<TimeslotFilter>,
  groups: FilterGroup<any>[],
};

export default function TimeslotFilters(props: Props) {
  const { group, groups, onFilterChange } = props;
  const moduleCodes = FilterGroup.union(groups, group);

  const children = new Map();
  Timeslots.forEach(([day, time]) => {
    const timeslot = getTimeslot(day, time);
    const filter = group.filters[TimeslotFilter.labelToId(timeslot)];
    const count = filter.count(moduleCodes);

    children.set(
      timeslot,
      <label
        className={classnames(styles.label, { [styles.enabled]: filter.enabled })}
        title={`${count} modules with lessons on ${timeslot}`}
      >
        <span className="sr-only">{timeslot}</span>
        <span>{count}</span>
        <input
          className="sr-only"
          type="checkbox"
          checked={filter.enabled}
          onChange={() => onFilterChange(group.toggle(filter))}
        />
      </label>,
    );
  });

  return (
    <div className={styles.timeslot}>
      <h4 className={styles.heading}>{group.label}</h4>
      <TimeslotTable>{children}</TimeslotTable>
    </div>
  );
}
