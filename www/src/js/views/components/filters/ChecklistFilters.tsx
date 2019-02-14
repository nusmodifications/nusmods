import * as React from 'react';
import { values } from 'lodash';

import { AnyGroup, OnFilterChange } from 'types/views';

import FilterGroup from 'utils/filters/FilterGroup';
import styles from './styles.scss';
import Checklist from './Checklist';

type Props = {
  onFilterChange: OnFilterChange;
  groups: AnyGroup[];
  group: AnyGroup;
};

export default function ChecklistFilters(props: Props) {
  const { group, groups, onFilterChange } = props;
  const moduleCodes = FilterGroup.union(groups, group);

  return (
    <div className={styles.checklist}>
      <h4 className={styles.heading}>{group.label}</h4>
      <Checklist
        groupId={group.id}
        filters={values(group.filters)}
        onChange={(filter) => onFilterChange(group.toggle(filter))}
        getCount={(filter) => filter.count(moduleCodes)}
      />
    </div>
  );
}
