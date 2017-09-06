// @flow
import React, { Component } from 'react';
import Waypoint from 'react-waypoint';
import _ from 'lodash';

import type { Module } from 'types/modules';

import ModuleFinderPage from './ModuleFinderPage';

const MODULES_PER_PAGE = 10;

type Props = {
  startingPage?: number,
  modules: Module[],
  onPageChange: (page: number) => void,
};

type State = {
  startingPage: number,
  shownPages: number,
};

function getPageKey(modules: Module[]): string {
  const getId = module => _.get(module, 'ModuleCode', '');
  return `${getId(_.head(modules))}-${getId(_.last(modules))}`;
}

export default class ModuleFinderList extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);

    if (props.startingPage) this.state.startingPage = props.startingPage;
  }

  state = {
    shownPages: 2,
    startingPage: 0,
  };

  onEnterPage(currentPage: number) {
    // If we are one page away from the bottom, load the next page
    if (currentPage + 1 >= this.state.shownPages) {
      this.setState(prevState => ({
        shownPages: Math.min(prevState.shownPages + 1, this.pages().length),
      }));
    }

    this.props.onPageChange(this.state.startingPage + currentPage);
  }

  onShowPreviousPage = () => {
    this.setState(prevState => ({
      startingPage: prevState.startingPage - 1,
      shownPages: prevState.shownPages + 1,
    }));
  };

  pages() {
    return _.chunk(this.props.modules, MODULES_PER_PAGE);
  }

  start(page: number) {
    return (page + this.state.startingPage) * MODULES_PER_PAGE;
  }

  end(page: number) {
    return this.start(page) + MODULES_PER_PAGE;
  }

  render() {
    const { startingPage, shownPages } = this.state;
    const pages = this.pages().slice(startingPage, startingPage + shownPages);
    const total = this.props.modules.length;

    return (
      <div>
        {startingPage !== 0 && <button onClick={this.onShowPreviousPage} className="btn btn-outline-primary btn-block">
          Show previous page
        </button>}

        {pages.map((page, i) => (
          <div key={getPageKey(page)}>
            <Waypoint onEnter={() => this.onEnterPage(i)}>
              <div>
                {startingPage + i !== 0 &&
                  <div className="module-page-divider">
                    {this.start(i)}-{this.end(i)} of {total} modules
                  </div>}
                <ModuleFinderPage page={page} />
              </div>
            </Waypoint>
          </div>
        ))}
      </div>
    );
  }
}
