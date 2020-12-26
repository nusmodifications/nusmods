import { Module } from 'types/modules';
import { queryAllByAttribute, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

/** @var {Module} */
import { CS1010S } from '__mocks__/modules';
import { initAction } from 'test-utils/redux';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import reducers from 'reducers';
import configureStore from 'bootstrapping/configure-store';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';
import ModulePageContent from './ModulePageContent';

describe('ModulePageContent', () => {
  function make(module: Module = CS1010S) {
    const initialState = reducers(undefined, initAction());
    const { store } = configureStore(initialState);
    return renderWithRouterMatch(
      <Provider store={store}>
        <ModulePageContent module={module} />
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

  test('side menu items should appear in the same order in the document', () => {
    // Custom query that returns all elements containing id attribute
    const getAllById = queryAllByAttribute.bind(null, 'id');

    const { view } = make();

    const orderedSideMenuItems = screen
      .getAllByRole('link')
      .map((elem) => elem.textContent?.toLowerCase());
    const orderedDocumentItems = getAllById(view.container, 'side-menu-items').map((elem) => elem.id);
    expect(orderedSideMenuItems).toEqual(orderedDocumentItems);
  });
});
