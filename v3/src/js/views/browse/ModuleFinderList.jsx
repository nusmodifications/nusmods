// @flow

import React from 'react';
import FilterGroup from 'utils/filters/FilterGroup';
import type { Module } from 'types/modules';
import ModuleFinderItem from 'views/components/ModuleFinderItem';

type Props = {
  modules: Array<Module>,
  filterGroups: Array<FilterGroup<any>>,
};

export default function ModuleFinderList(props: Props) {
  const { modules, filterGroups } = props;
  const filteredModules = FilterGroup.apply(modules, filterGroups);

  return (
    <ul className="modules-list">
      {filteredModules.slice(0, 30).map((module) => {
        return <ModuleFinderItem module={module} />;
      })}
    </ul>
  );
}
