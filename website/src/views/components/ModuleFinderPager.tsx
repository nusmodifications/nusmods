import * as React from 'react';
import classnames from 'classnames';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'views/components/icons';
import { PagerProps, FIRST_PAGE_INDEX } from 'views/components/searchkit/Pagination';
import { range } from 'lodash';

import styles from './ModuleFinderPager.scss';

type PagerButtonProps = {
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

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

const PagerButton: React.FC<PagerButtonProps> = ({ disabled, active, onClick, children }) => (
  <li>
    <button
      type="button"
      className={classnames(
        'btn',
        styles.pagerButton,
        disabled && styles.disabled,
        active && styles.active,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  </li>
);

const ModuleFinderPager: React.FC<PagerProps> = ({
  selectedPage,
  totalNumPages,
  onGoToFirst,
  onGoToPrevious,
  onGoToPage,
  onGoToNext,
  onGoToLast,
}) => {
  if (totalNumPages <= 0) return null;

  // Number of pages to show in the pager
  const numVisiblePages = 7;
  const startEndPages = displayPageRange(selectedPage, totalNumPages, numVisiblePages);
  if (!startEndPages) return null;

  const { firstPageNum, lastPageNum } = startEndPages;
  const pageRange = range(firstPageNum, lastPageNum + 1);

  return (
    <nav aria-label="Module search result pagination">
      <ul className="pagination justify-content-center">
        <PagerButton disabled={selectedPage === FIRST_PAGE_INDEX} onClick={onGoToFirst}>
          <span aria-hidden="true">
            <ChevronsLeft className={styles.svg} />
          </span>
          <span className="sr-only">First</span>
        </PagerButton>
        <PagerButton disabled={selectedPage === FIRST_PAGE_INDEX} onClick={onGoToPrevious}>
          <span aria-hidden="true">
            <ChevronLeft className={styles.svg} />
          </span>
          <span className="sr-only">Previous</span>
        </PagerButton>
        {pageRange.map((pageNum) => (
          <PagerButton
            key={pageNum}
            active={selectedPage === pageNum}
            onClick={() => onGoToPage(pageNum)}
          >
            {pageNum}
          </PagerButton>
        ))}
        <PagerButton disabled={selectedPage === totalNumPages} onClick={onGoToNext}>
          <span aria-hidden="true">
            <ChevronRight className={styles.svg} />
          </span>
          <span className="sr-only">Next</span>
        </PagerButton>
        <PagerButton disabled={selectedPage === totalNumPages} onClick={onGoToLast}>
          <span aria-hidden="true">
            <ChevronsRight className={styles.svg} />
          </span>
          <span className="sr-only">Last</span>
        </PagerButton>
      </ul>
    </nav>
  );
};

export default ModuleFinderPager;
