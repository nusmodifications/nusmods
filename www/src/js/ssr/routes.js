// @flow
import { matchPath, type Match, type MatchPathOptions } from 'react-router-dom';
import type { Store } from 'redux';
import type { State } from 'reducers';
import { getModule, getModuleList } from './data';

type RouteDataLoader = (store: Store<State, *, *>, match: Match) => Promise<*>;
type Route = MatchPathOptions & { loadData: RouteDataLoader };
type DataLoader = (store: Store<State, *, *>) => Promise<*>;

const routes: Route[] = [
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

export default function getDataLoaders(path: string): DataLoader[] {
  // By default the module list will always be loaded
  const dataLoaders = [async (store) => store.dispatch(await getModuleList())];

  // Add any additional data loader required by the route
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const match = matchPath(path, route);

    if (match) {
      dataLoaders.push((store) => route.loadData(store, match));
    }
  }

  return dataLoaders;
}
