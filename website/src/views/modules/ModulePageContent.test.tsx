import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Module } from 'types/modules';

/** @var {Module} */
import { CS1010S } from '__mocks__/modules';
import { initAction } from 'test-utils/redux';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import reducers from 'reducers';
import configureStore from 'bootstrapping/configure-store';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';
import ModulePageContent from './ModulePageContent';

describe('ModulePageContent', () => {
  function make(module: Module = CS1010S, archiveYear?: string) {
    const initialState = reducers(undefined, initAction());
    const { store } = configureStore(initialState);
    return renderWithRouterMatch(
      <Provider store={store}>
        <ModulePageContent module={module} archiveYear={archiveYear} />
      </Provider>,
      {},
    );
  }

  beforeEach(() => {
    mockDom();
  });

  afterEach(() => {
    mockDomReset();
  });

  test('shows course history after the report-error FAQ on current and archived course pages', () => {
    const currentPage = make();
    const currentHistory = screen.getByText('Course History');
    const currentFaq = screen.getByRole('link', { name: 'FAQ' });
    expect(currentFaq.compareDocumentPosition(currentHistory)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    currentPage.view.unmount();

    make(CS1010S, '2024/2025');
    const archiveHistory = screen.getByText('Course History');
    const archiveFaq = screen.getByRole('link', { name: 'FAQ' });
    expect(archiveFaq.compareDocumentPosition(archiveHistory)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  test('side menu items should appear in the same order in the document', () => {
    const { view } = make();
    const { container } = view;

    const sideMenuItems = screen
      .getAllByRole('link')
      // We only want to match intra-page navigation, not links to outside the page
      .filter((elem) => (elem as HTMLAnchorElement).href?.startsWith('#'))
      .map((elem) => (elem as HTMLAnchorElement).href.slice(1));

    const sideMenuSet = new Set(sideMenuItems);
    const documentIds = Array.from(container.querySelectorAll('[id]'))
      .map((ele) => ele.id)
      .filter((ele) => sideMenuSet.has(ele));

    // We are explicitly checking that all nav items have a matching element to navigate to, and the nav
    // items appear in the same order in the page as the element it navigates to
    expect(sideMenuItems).toEqual(documentIds);
  });
});
