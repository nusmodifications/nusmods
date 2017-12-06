// @flow
import React, { Component } from 'react';
import Waypoint from 'react-waypoint';
import _ from 'lodash';

import type { Module } from 'types/modules';
import type { PageRange, PageRangeDiff, OnPageChange } from 'types/views';

import { AlertTriangle } from 'views/components/icons';
import ModuleFinderPage from './ModuleFinderPage';
import styles from './ModuleFinderList.scss';

const MODULES_PER_PAGE = 5;

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
  onEnterPage(fromStart: number) {
    const { start, loaded } = this.props.page;

    // Update current page to the new page
    const diff: PageRangeDiff = { current: fromStart + start };

    // If we are one page away from the bottom, load the next page
    if (fromStart + 1 >= loaded) {
      diff.loaded = 1;
    }

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
    return ((page + this.props.page.start) * MODULES_PER_PAGE) + 1;
  }

  end(page: number) {
    return Math.min(this.props.modules.length, this.start(page) + (MODULES_PER_PAGE - 1));
  }

  render() {
    const { start, loaded: shownPages } = this.props.page;
    const pages = this.pages().slice(start, start + shownPages);
    const total = this.props.modules.length;

    if (total === 0) {
      return (
        <div className="text-center mt-4">
          <AlertTriangle className={styles.noModulesIcon} />
          <h4>No modules found</h4>
        </div>
      );
    }

    return (
      <div>
        {start !== 0 && <button onClick={this.onShowPreviousPage} className="btn btn-outline-primary btn-block">
          Show previous page
        </button>}

        {pages.map((page, i) => (
          <Waypoint key={getPageKey(page)} onEnter={() => this.onEnterPage(i)}>
            <div>
              <div className="module-page-divider">
                {this.start(i)}-{this.end(i)} of {total} modules
              </div>
              <ModuleFinderPage page={page} />
            </div>
          </Waypoint>
        ))}
      </div>
    );
  }
}
