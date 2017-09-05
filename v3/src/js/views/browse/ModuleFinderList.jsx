// @flow

import React, { Component } from 'react';
import Waypoint from 'react-waypoint';
import _ from 'lodash';
import type { Module } from 'types/modules';

import ModuleFinderPage from './ModuleFinderPage';

const MODULES_PER_PAGE = 10;
const LOAD_TRIGGER_OFFSET = 200;

type Props = {
  modules: Module[],
};

type State = {
  shownPages: number,
};

function getPageKey(modules: Module[]): string {
  const getId = module => _.get(module, 'ModuleCode', '');
  return `${getId(_.head(modules))}-${getId(_.last(modules))}`;
}

export default class ModuleFinderList extends Component<Props, State> {
  props: Props;

  state = {
    shownPages: 1,
  };

  pages() {
    return _.chunk(this.props.modules, MODULES_PER_PAGE);
  }

  showNextPage = () => {
    this.setState(prevState => ({
      shownPages: Math.min(prevState.shownPages + 1, this.pages().length),
    }));
  };

  render() {
    const { shownPages } = this.state;
    const pages = this.pages().slice(0, shownPages);

    return (
      <div>
        {pages.map(page => (
          <ModuleFinderPage
            page={page}
            key={getPageKey(page)}
          />
        ))}

        <Waypoint
          onEnter={this.showNextPage}
          bottomOffset={-LOAD_TRIGGER_OFFSET}
        />
      </div>
    );
  }
}
