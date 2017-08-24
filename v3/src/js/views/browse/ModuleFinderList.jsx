// @flow
import React from 'react';

import type { Module } from 'types/modules';

import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFinderItem from 'views/components/ModuleFinderItem';

type Props = {
  modules: Module[],
  filterGroups: FilterGroup<any>[],
};

export default function ModuleFinderList(props: Props) {
  const { modules, filterGroups } = props;
  const filteredModules = FilterGroup.apply(modules, filterGroups);

  return (
    <ul className="modules-list">
      {filteredModules.slice(0, 30).map(module =>
        <ModuleFinderItem key={module.ModuleCode} module={module} />,
      )}
    </ul>
  );
}
