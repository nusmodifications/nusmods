import * as React from 'react';
import classnames from 'classnames';
import { range } from 'lodash';

import { breakpointDown } from 'utils/css';
import makeResponsive from 'views/hocs/makeResponsive';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'views/components/icons';
import { PagerProps, FIRST_PAGE_INDEX } from 'views/components/searchkit/Pagination';
import ModuleFinderPagerButton from 'views/components/ModuleFinderPagerButton';

import styles from './ModuleFinderPager.scss';

// Calculate first and last page nums to display in pager.
export function displayPageRange(
  selectedPage: number,
  totalNumPages: number,
  numVisiblePages: number,
) {
  if (selectedPage === 0 || numVisiblePages === 0 || totalNumPages === 0) return null;

  let firstPageNum = selectedPage - Math.floor(numVisiblePages / 2);
  let lastPageNum = firstPageNum + numVisiblePages - 1;
  if (firstPageNum < FIRST_PAGE_INDEX) {
    lastPageNum += FIRST_PAGE_INDEX - firstPageNum;
    firstPageNum = FIRST_PAGE_INDEX;
  }
  lastPageNum = Math.min(totalNumPages, lastPageNum);
  return { firstPageNum, lastPageNum };
}

type Props = PagerProps & {
  readonly matchBreakpoint: boolean;
};

const ModuleFinderPager: React.FC<Props> = ({
  selectedPage,
  totalNumPages,
  onGoToFirst,
  onGoToPrevious,
  onGoToPage,
  onGoToNext,
  onGoToLast,
  matchBreakpoint,
}) => {
  if (totalNumPages <= 0) return null;

  function renderDesktopPages() {
    // Number of pages to show in the pager
    const numVisiblePages = 7;
    const startEndPages = displayPageRange(selectedPage, totalNumPages, numVisiblePages);
    if (!startEndPages) return null;

    const { firstPageNum, lastPageNum } = startEndPages;
    const pageRange = range(firstPageNum, lastPageNum + 1);

    return pageRange.map((pageNum) => (
      <ModuleFinderPagerButton
        key={pageNum}
        active={selectedPage === pageNum}
        onClick={() => onGoToPage(pageNum)}
      >
        {pageNum}
      </ModuleFinderPagerButton>
    ));
  }

  function renderMobilePages() {
    return (
      <span className={styles.mobilePages}>
        Page {selectedPage} of {totalNumPages}
      </span>
    );
  }

  return (
    <nav aria-label="Module search result pagination">
      <ul className={classnames('pagination justify-content-center', styles.paginationList)}>
        <ModuleFinderPagerButton disabled={selectedPage === FIRST_PAGE_INDEX} onClick={onGoToFirst}>
          <span aria-hidden="true">
            <ChevronsLeft className={styles.svg} />
          </span>
          <span className="sr-only">First</span>
        </ModuleFinderPagerButton>
        <ModuleFinderPagerButton
          disabled={selectedPage === FIRST_PAGE_INDEX}
          onClick={onGoToPrevious}
        >
          <span aria-hidden="true">
            <ChevronLeft className={styles.svg} />
          </span>
          <span className="sr-only">Previous</span>
        </ModuleFinderPagerButton>

        {matchBreakpoint ? renderMobilePages() : renderDesktopPages()}

        <ModuleFinderPagerButton disabled={selectedPage === totalNumPages} onClick={onGoToNext}>
          <span aria-hidden="true">
            <ChevronRight className={styles.svg} />
          </span>
          <span className="sr-only">Next</span>
        </ModuleFinderPagerButton>
        <ModuleFinderPagerButton disabled={selectedPage === totalNumPages} onClick={onGoToLast}>
          <span aria-hidden="true">
            <ChevronsRight className={styles.svg} />
          </span>
          <span className="sr-only">Last</span>
        </ModuleFinderPagerButton>
      </ul>
    </nav>
  );
};

const ResponsiveModuleFinderPager = makeResponsive(ModuleFinderPager, breakpointDown('md'));
export default ResponsiveModuleFinderPager;
