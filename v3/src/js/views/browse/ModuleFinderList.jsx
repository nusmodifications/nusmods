// @flow
import React, { Component } from 'react';
import Waypoint from 'react-waypoint';
import _ from 'lodash';

import type { Module } from 'types/modules';
import type { PageRange, PageRangeDiff, OnPageChange } from 'types/views';

import ModuleFinderPage from './ModuleFinderPage';

const MODULES_PER_PAGE = 10;

type Props = {
  page: PageRange,
  modules: Module[],
  onPageChange: OnPageChange,
};

function getPageKey(modules: Module[]): string {
  const getId = module => _.get(module, 'ModuleCode', '');
  return `${getId(_.head(modules))}-${getId(_.last(modules))}`;
}

export default class ModuleFinderList extends Component<Props> {
  props: Props;

  onEnterPage(current: number) {
    const diff: PageRangeDiff = { current };

    // If we are one page away from the bottom, load the next page
    if (current + 1 >= this.props.page.pages) diff.pages = 1;

    this.props.onPageChange(diff);
  }

  onShowPreviousPage = () => {
    this.props.onPageChange({
      start: -1,
      pages: 1,
    });
  };

  pages() {
    return _.chunk(this.props.modules, MODULES_PER_PAGE);
  }

  start(page: number) {
    return (page + this.props.page.start) * MODULES_PER_PAGE;
  }

  end(page: number) {
    return this.start(page) + MODULES_PER_PAGE;
  }

  render() {
    const { start, pages: shownPages } = this.props.page;
    const pages = this.pages().slice(start, start + shownPages);
    const total = this.props.modules.length;

    return (
      <div>
        {start !== 0 && <button onClick={this.onShowPreviousPage} className="btn btn-outline-primary btn-block">
          Show previous page
        </button>}

        {pages.map((page, i) => (
          <div key={getPageKey(page)}>
            <Waypoint onEnter={() => this.onEnterPage(i + start)}>
              <div>
                {start + i !== 0 &&
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
