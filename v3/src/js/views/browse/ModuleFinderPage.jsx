// @flow

import React, { PureComponent } from 'react';

import type { Module } from 'types/modules';
import ModuleFinderItem from 'views/components/ModuleFinderItem';

type Props = {
  page: Module[],
};

export default class ModuleFinderPage extends PureComponent<Props> {
  props: Props;

  render() {
    const { page } = this.props;

    return (
      <div>
        <ul className="modules-list">
          {page.map((module) => {
            return <ModuleFinderItem key={module.ModuleCode} module={module} />;
          })}
        </ul>
      </div>
    );
  }
}
