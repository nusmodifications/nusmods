import { RouteComponentProps } from 'react-router-dom';
// react-router-dom internal dependency, used here to construct the history
// object needed for testing. This is not added as a dev dependency to avoid
// version desync between the version depended on by react-router-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import { Location, createMemoryHistory } from 'history';
import _ from 'lodash';

type MatchShape = {
  params?: { [key: string]: string | null | undefined };
  isExact?: boolean;
};

type HistoryEntry = string | Partial<Location>;

export default function createHistory<T>(
  initialEntries: HistoryEntry | Readonly<HistoryEntry[]> = '/',
  matchParams: MatchShape = {},
): RouteComponentProps<T> {
  const entries = _.castArray(initialEntries);
  const history = createMemoryHistory({ initialEntries: entries as any });
  const { params = {}, isExact = true } = matchParams;

  const match = {
    params,
    isExact,
    path: entries[0],
    url: entries[0],
  } as any;

  return {
    history,
    match,
    location: history.location,
  };
}
