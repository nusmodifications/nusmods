import React from 'react';
import { PaginationAccessor, SearchkitComponent, SearchkitComponentProps } from 'searchkit';
import { clamp, get } from 'lodash';

export interface PagerProps {
  selectedPage: number;
  totalNumPages: number;
  onGoToFirst: () => void;
  onGoToPrevious: () => void;
  onGoToPage: (page: number) => void;
  onGoToNext: () => void;
  onGoToLast: () => void;
}

export interface PaginationProps extends SearchkitComponentProps {
  pagerComponent: React.ElementType<PagerProps>;
}

export const FIRST_PAGE_INDEX = 1;

// Custom equivalent of Searchkit's Pagination component
// eslint-disable-next-line @typescript-eslint/ban-types
export default class Pagination extends SearchkitComponent<PaginationProps, {}> {
  paginationAccessor() {
    return this.accessor as PaginationAccessor;
  }

  // eslint-disable-next-line class-methods-use-this
  defineAccessor() {
    return new PaginationAccessor('p');
  }

  getCurrentPage() {
    return Number(this.paginationAccessor().state.getValue()) || FIRST_PAGE_INDEX;
  }

  getTotalPages() {
    return Math.ceil(this.getHitsCount() / get(this.getQuery(), 'query.size', 10));
  }

  onGoToFirst = () => this.setPage(FIRST_PAGE_INDEX);

  onGoToPrevious = () => this.setPage(this.getCurrentPage() - 1);

  onGoToPage = (page: number) => this.setPage(page);

  onGoToNext = () => this.setPage(this.getCurrentPage() + 1);

  onGoToLast = () => this.setPage(this.getTotalPages());

  setPage(requestedPage: number) {
    const page = clamp(requestedPage, FIRST_PAGE_INDEX, this.getTotalPages());
    if (page === this.getCurrentPage()) {
      return; // Same page, no need to rerun query
    }
    this.paginationAccessor().state = this.paginationAccessor().state.setValue(page);
    this.searchkit.performSearch();
  }

  render() {
    if (!this.paginationAccessor()) return null;
    if (!this.hasHits()) return null;

    const { pagerComponent: Pager } = this.props;
    return (
      <Pager
        selectedPage={this.getCurrentPage()}
        totalNumPages={this.getTotalPages()}
        onGoToFirst={this.onGoToFirst}
        onGoToPrevious={this.onGoToPrevious}
        onGoToPage={this.onGoToPage}
        onGoToNext={this.onGoToNext}
        onGoToLast={this.onGoToLast}
      />
    );
  }
}
