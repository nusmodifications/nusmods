import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Route, Router } from 'react-router-dom';
import createHistory from './createHistory';

/**
 * `render` `children` in a `Router` and `Route` so that `children` have
 * populated route matches when using React Router.
 *
 * Inspiration: https://spectrum.chat/testing-library/help-react/attempting-to-test-react-router-match~b0550426-f54a-4b76-b402-c7b32204b55e?m=MTU2OTM1MzY4NjUwNw==
 */
export default function renderWithRouterMatch(
  children: ReactNode,
  {
    path = '/',
    location = '/',
  }: {
    path?: string;
    location?: Parameters<typeof createHistory>[0];
  },
  renderOptions?: Omit<RenderOptions, 'queries'> | undefined,
) {
  const { history } = createHistory(location);
  const view = render(
    <Router history={history}>
      <Route path={path}>{children}</Route>
    </Router>,
    renderOptions,
  );
  return {
    history,
    view,
  };
}
