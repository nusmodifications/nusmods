import * as React from 'react';
import classnames from 'classnames';
import { PagerProps, FIRST_PAGE_INDEX } from 'views/components/searchkit/Pagination';
import { range } from 'lodash';

// Number of pages to show before/after the current number
const pageScope = 3;

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

  const numberRange = range(
    Math.max(selectedPage - pageScope, FIRST_PAGE_INDEX),
    Math.min(totalNumPages, selectedPage + pageScope) + 1,
  );
  return (
    <nav aria-label="Module search result pagination">
      <ul className="pagination justify-content-center">
        <li className={classnames('page-item', selectedPage === FIRST_PAGE_INDEX && 'disabled')}>
          <button type="button" className="page-link" onClick={onGoToFirst}>
            First
          </button>
        </li>
        <li className={classnames('page-item', selectedPage === FIRST_PAGE_INDEX && 'disabled')}>
          <button type="button" className="page-link" onClick={onGoToPrevious}>
            Previous
          </button>
        </li>
        {numberRange.map((pageNum) => (
          <li
            key={pageNum}
            className={classnames('page-item', selectedPage === pageNum && 'active')}
          >
            <button type="button" className="page-link" onClick={() => onGoToPage(pageNum)}>
              {pageNum}
            </button>
          </li>
        ))}
        <li className={classnames('page-item', selectedPage === totalNumPages && 'disabled')}>
          <button type="button" className="page-link" onClick={onGoToNext}>
            Next
          </button>
        </li>
        <li className={classnames('page-item', selectedPage === totalNumPages && 'disabled')}>
          <button type="button" className="page-link" onClick={onGoToLast}>
            Last
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ModuleFinderPager;
