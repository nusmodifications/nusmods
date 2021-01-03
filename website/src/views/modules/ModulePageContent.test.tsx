import { Module } from 'types/modules';
import { screen } from '@testing-library/react';
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
    const { view } = make();
    const { container } = view;
    const sideMenuItems = screen
      .getAllByRole('link')
      .map((elem) => elem.textContent?.toLowerCase());
    const sideMenuSet = new Set(sideMenuItems);
    const documentIds = Array.from(container.querySelectorAll('[id]'))
      .map((ele) => ele.id)
      .filter((ele) => sideMenuSet.has(ele));
    expect(sideMenuItems).toEqual(documentIds);
  });
});
