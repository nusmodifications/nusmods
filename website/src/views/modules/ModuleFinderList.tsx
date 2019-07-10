import * as React from 'react';
import { Waypoint } from 'react-waypoint';
import { chunk, get, head, last } from 'lodash';

import { ModuleInformation } from 'types/modules';
import { OnPageChange, PageRange, PageRangeDiff } from 'types/views';

import Warning from 'views/errors/Warning';
import ModuleFinderPage from './ModuleFinderPage';

const MODULES_PER_PAGE = 5;

type Props = {
  page: PageRange;
  modules: ModuleInformation[];
  onPageChange: OnPageChange;
};

function getPageKey(modules: ModuleInformation[]): string {
  const getId = (module: ModuleInformation | undefined) => get(module, 'moduleCode', '');
  return `${getId(head(modules))}-${getId(last(modules))}`;
}

export default class ModuleFinderList extends React.Component<Props> {
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
    });
  };

  pages(): ModuleInformation[][] {
    return chunk(this.props.modules, MODULES_PER_PAGE);
  }

  start(page: number) {
    return (page + this.props.page.start) * MODULES_PER_PAGE + 1;
  }

  end(page: number) {
    return Math.min(this.props.modules.length, this.start(page) + (MODULES_PER_PAGE - 1));
  }

  render() {
    const { start, loaded: shownPages } = this.props.page;
    const pages = this.pages().slice(start, start + shownPages);
    const total = this.props.modules.length;

    if (total === 0) {
      return <Warning message="No modules found" />;
    }

    return (
      <div>
        {start !== 0 && (
          <button
            onClick={this.onShowPreviousPage}
            type="button"
            className="btn btn-outline-primary btn-block"
          >
            Show previous page
          </button>
        )}

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
