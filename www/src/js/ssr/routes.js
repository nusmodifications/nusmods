// @flow
import { matchPath, type Match, type MatchPathOptions } from 'react-router-dom';
import type { Store } from 'redux';
import type { State } from 'reducers';
import { getModule } from './data';

type DataLoader = (store: Store<State, *, *>, match: Match) => Promise<*>;
type Route = string | (MatchPathOptions & { loadData: DataLoader });

const routes: Route[] = [
  // Routes with no data loading requirements
  '/faq',
  '/about',
  '/contributors',
  '/contact',
  '/settings',
  '/team',

  // Routes that load data
  {
    path: '/modules/:moduleCode/:slug?',
    loadData: async (store, match) => {
      if (!match.params.moduleCode) {
        throw new Error();
      }

      store.dispatch(await getModule(match.params.moduleCode));
    },
  },
];

export default function getDataLoader(path: string): ?(Store<State, *, *>) => Promise<*> {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const match = matchPath(path, route);

    if (match) {
      return typeof route === 'string' ? null : (store) => route.loadData(store, match);
    }
  }

  return null;
}
