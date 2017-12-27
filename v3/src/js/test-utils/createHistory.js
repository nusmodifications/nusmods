// @flow

import type { ContextRouter } from 'react-router-dom';
import _ from 'lodash';

// react-router-dom internal dependency, used here to construct the history
// object needed for testing. This is not added as a dev dependency to avoid
// version desync between the version depended on by react-router-dom
import createMemoryHistory from 'history/createMemoryHistory'; // eslint-disable-line import/no-extraneous-dependencies

type MatchShape = {
  params?: { [string]: ?string },
  isExact?: boolean
}

export default function createHistory(
  initialEntries: string | string[] = '/',
  matchParams: MatchShape = {},
): ContextRouter {
  const entries = _.castArray(initialEntries);
  const history = createMemoryHistory({ initialEntries: entries });
  const { params = {}, isExact = true } = matchParams;

  const match = {
    params,
    isExact,
    path: entries[0],
    url: entries[0],
  };

  return {
    history,
    match,
    location: history.location,
  };
}
