import { act, render } from '@testing-library/react';
import type { FC } from 'react';
import { Router } from 'react-router-dom';
import createHistory from 'test-utils/createHistory';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import { scrollToHash } from 'utils/react';

import useScrollToTopEffect from './useScrollToTopEffect';

jest.mock('utils/react');
const mockedScrollToHash = scrollToHash as jest.MockedFunction<typeof scrollToHash>;

const Tester: FC = () => {
  useScrollToTopEffect();
  return null;
};

describe(useScrollToTopEffect, () => {
  beforeEach(() => {
    mockDom();
  });

  afterEach(() => {
    mockedScrollToHash.mockReset();
    mockDomReset();
  });

  function make(initialHistoryEntries: Parameters<typeof createHistory>[0] = undefined) {
    const { history } = createHistory(initialHistoryEntries);
    render(
      <Router history={history}>
        <Tester />
      </Router>,
    );
    return history;
  }

  test('should scroll to top on mount if window location has no hash', () => {
    make();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockedScrollToHash).not.toHaveBeenCalled();
  });

  test('should scroll to hash on mount if window location has a hash', () => {
    make('/foo#hash');
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(mockedScrollToHash).toHaveBeenCalled();
  });

  test('should not scroll after first completed render', () => {
    const history = make();
    expect(window.scrollTo).toHaveBeenCalledTimes(1); // Sanity check
    act(() => history.push('/bar'));
    act(() => history.push('/baz#hash'));
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });
});
