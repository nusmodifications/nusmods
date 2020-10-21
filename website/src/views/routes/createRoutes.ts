import type { Dispatch } from 'redux';
import { JSResource } from 'utils/JSResource';
import { fetchModuleList } from 'actions/moduleBank';
import { captureException } from '@sentry/browser';
import venueLocationResource from 'views/components/map/venueLocationResource';
import { EntryPointRouteConfig } from './RoutingContext';

// TODO: Define entry points closer to modules
export default function createRoutes(dispatch: Dispatch): EntryPointRouteConfig[] {
  return [
    {
      componentResource: JSResource(
        'AppShell',
        () => import(/* webpackChunkName: "AppShell.route" */ 'views/AppShell'),
      ),
      prepare() {
        const moduleList = JSResource('moduleList', async () => {
          try {
            // Typed as unknown because we don't actually need the output
            return (dispatch(fetchModuleList()) as unknown) as Promise<unknown>;
          } catch (error) {
            captureException(error);
            throw error;
          }
        });
        moduleList.preload();
        return {
          moduleList,
        };
      },
      routes: [
        {
          path: '/timetable/:semester?/:action?',
          exact: true,
          componentResource: JSResource(
            'TimetableContainer',
            () =>
              import(
                /* webpackChunkName: "TimetableContainer.route" */ 'views/timetable/TimetableContainer'
              ),
          ),
          prepare: ({ semester, action }) => ({}),
        },
        {
          path: '/today',
          exact: true,
          componentResource: JSResource(
            'TodayContainer',
            () =>
              import(/* webpackChunkName: "TodayContainer.route" */ 'views/today/TodayContainer'),
          ),
          prepare: () => {
            venueLocationResource.preloadOrReloadIfError();
            return {};
          },
        },
        //   {
        //     path: '/issue/:id',
        //     component: JSResource('IssueDetailRoot', () => import('./IssueDetailRoot')),
        //     prepare: (params) => {
        //       const IssueDetailQuery = require('./__generated__/IssueDetailRootQuery.graphql');
        //       return {
        //         issueDetailQuery: preloadQuery(
        //           RelayEnvironment,
        //           IssueDetailQuery,
        //           {
        //             id: params.id,
        //           },
        //           { fetchPolicy: 'store-or-network' },
        //         ),
        //       };
        //     },
        //   },
      ],
    },
  ];
}
