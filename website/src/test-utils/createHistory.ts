import type { RouteComponentProps, match as Match } from 'react-router-dom';
// react-router-dom internal dependency, used here to construct the history
// object needed for testing. This is not added as a dev dependency to avoid
// version desync between the version depended on by react-router-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory } from 'history';
import _ from 'lodash';

type MatchShape = {
  params?: { [key: string]: string | null | undefined };
  isExact?: boolean;
};

// This can also be Location, but no test case use that for now so we leave it
// out for simplicity
type HistoryEntry = string;

// eslint-disable-next-line @typescript-eslint/ban-types
export default function createHistory<T = {}>(
  initialEntries: HistoryEntry | Readonly<HistoryEntry[]> = '/',
  matchParams: MatchShape = {},
): RouteComponentProps<T> {
  const entries = _.castArray(initialEntries);
  const history = createMemoryHistory({ initialEntries: entries as any });
  const { params = {}, isExact = true } = matchParams;

  const match: Match<T> = {
    // Not strictly type safe, but it's good enough for tests
    params: (params as unknown) as T,
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
