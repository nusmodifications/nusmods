import { FC, memo } from 'react';
import classnames from 'classnames';
import { range } from 'lodash';

import { breakpointDown } from 'utils/css';
import useMediaQuery from 'views/hooks/useMediaQuery';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'react-feather';
import { PagerProps, FIRST_PAGE_INDEX } from 'views/components/searchkit/Pagination';
import ModuleFinderPagerButton from 'views/modules/ModuleFinderPagerButton';

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

const ModuleFinderPager: FC<PagerProps> = ({
  selectedPage,
  totalNumPages,
  onGoToFirst,
  onGoToPrevious,
  onGoToPage,
  onGoToNext,
  onGoToLast,
}) => {
  const matchBreakpoint = useMediaQuery(breakpointDown('md'));

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
    return <span className={styles.mobilePages}>Page {selectedPage}</span>;
  }

  return (
    <nav aria-label="Module search result pagination">
      <ul className={classnames('pagination justify-content-center', styles.paginationList)}>
        <ModuleFinderPagerButton
          tooltipTitle="First page"
          disabled={selectedPage === FIRST_PAGE_INDEX}
          onClick={onGoToFirst}
        >
          <ChevronsLeft className={styles.svg} />
        </ModuleFinderPagerButton>
        <ModuleFinderPagerButton
          tooltipTitle="Previous page"
          disabled={selectedPage === FIRST_PAGE_INDEX}
          onClick={onGoToPrevious}
        >
          <ChevronLeft className={styles.svg} />
        </ModuleFinderPagerButton>

        {matchBreakpoint ? renderMobilePages() : renderDesktopPages()}

        <ModuleFinderPagerButton
          tooltipTitle="Next page"
          disabled={selectedPage === totalNumPages}
          onClick={onGoToNext}
        >
          <ChevronRight className={styles.svg} />
        </ModuleFinderPagerButton>
        <ModuleFinderPagerButton
          tooltipTitle="Last page"
          disabled={selectedPage === totalNumPages}
          onClick={onGoToLast}
        >
          <ChevronsRight className={styles.svg} />
        </ModuleFinderPagerButton>
      </ul>
    </nav>
  );
};

export default memo(ModuleFinderPager);
