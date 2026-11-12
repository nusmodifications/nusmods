import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { initAction } from 'test-utils/redux';
import reducers from 'reducers';
import configureStore from 'bootstrapping/configure-store';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';
import RequisiteRulePopup from './RequisiteRulePopup';

describe(RequisiteRulePopup, () => {
  function make(rule: string, summary?: string) {
    const initialState = reducers(undefined, initAction());
    const { store } = configureStore(initialState);

    return renderWithRouterMatch(
      <Provider store={store}>
        <RequisiteRulePopup rule={rule} summary={summary} />
      </Provider>,
      {},
    );
  }

  it('renders nothing when rule matches summary', () => {
    const rule = 'CS1010 or its equivalent';
    const { view } = make(rule, rule);
    expect(view.container).toBeEmptyDOMElement();
  });

  it('renders info icon with accessible label', () => {
    make('PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) CS1010:D)', 'CS1010');

    expect(
      screen.getByRole('button', { name: 'View detailed prerequisite rule' }),
    ).toBeInTheDocument();
  });
});
