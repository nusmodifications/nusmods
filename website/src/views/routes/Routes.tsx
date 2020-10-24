import React, { memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import NotFoundPage from 'views/errors/NotFoundPage';
import TimetableRootRedirector from 'views/timetable/TimetableRootRedirector';

import appShellEntryPoint from 'views/AppShell.entrypoint';
import timetableEntryPoint from 'views/timetable/Timetable.entrypoint';
import todayEntryPoint from 'views/today/Today.entrypoint';
import moduleFinderEntryPoint from 'views/modules/ModuleFinder.entrypoint';
import modulePageEntryPoint from 'views/modules/ModulePage.entrypoint';
import moduleArchiveEntryPoint from 'views/modules/ModuleArchive.entrypoint';

import type { Dispatch } from 'types/redux';
import type { EntryPoint, EntryPointPartialRouteObject, EntryPointRouteObject } from './types';

// import VenuesContainer from 'views/venues/VenuesContainer';
// import SettingsContainer from 'views/settings/SettingsContainer';
// import AboutContainer from 'views/static/AboutContainer';
// import ContributeContainer from 'views/contribute/ContributeContainer';
// import TeamContainer from 'views/static/TeamContainer';
// import ContributorsContainer from 'views/static/ContributorsContainer';
// import FaqContainer from 'views/static/FaqContainer';
// import AppsContainer from 'views/static/AppsContainer';
// import TodayContainer from 'views/today/TodayContainer';
// import PlannerContainer from 'views/planner/PlannerContainer';
// import TetrisContainer from 'views/tetris/TetrisContainer';

import EntryPointContainer from './EntryPointContainer';
import { RoutePreloaderProvider } from './RoutePreloaderContext';

function entryPointRoute(
  entryPoint: EntryPoint<any>,
  dispatch: Dispatch,
): EntryPointPartialRouteObject {
  return {
    element: <EntryPointContainer entryPoint={entryPoint} />,
    preloadCode: () => entryPoint.component.preloadOrReloadIfError(),
    preload(params) {
      entryPoint.component.preloadOrReloadIfError();
      entryPoint.prepare(params, dispatch);
    },
  };
}

// <Route path="/venues/:venue?" component={VenuesContainer} />
// today
// <Route path="/planner" component={PlannerContainer} />
// <Route path="/tetris" component={TetrisContainer} />

// <Route path="/about" component={AboutContainer} />
// <Route path="/faq" component={FaqContainer} />
// <Route path="/settings" component={SettingsContainer} />
// <Route path="/contribute" component={ContributeContainer} />
// <Route path="/team" component={TeamContainer} />
// <Route path="/contributors" component={ContributorsContainer} />
// <Route path="/apps" component={AppsContainer} />

function createPartialRoutes(dispatch: Dispatch): EntryPointPartialRouteObject[] {
  // IMPORTANT: Remember to update any route changes on the sitemap
  return [
    // v2 routes
    { path: '/venueavailability', element: <Navigate to="/venues" /> },
    { path: '/contribute/developers', element: <Navigate to="/contributors" /> },
    { path: '/contact', element: <Navigate to="/faq" /> },
    { path: '/help', element: <Navigate to="/faq" /> },
    // {
    //   path: '/news/nusdiscount',
    //   element: <ExternalRedirect to="https://www.facebook.com/nusdiscount/" />,
    // },
    // {
    //   path: '/news/bareNUS',
    //   element: <ExternalRedirect to="https://www.facebook.com/bareNUS" />,
    // },
    // { path: '/api', element: <ExternalRedirect to="https://api.nusmods.com" appendPath /> },

    {
      ...entryPointRoute(appShellEntryPoint, dispatch),
      children: [
        {
          path: '/',
          element: <Navigate to="/timetable" />,
        },
        {
          path: '/timetable',
          children: [
            {
              path: ':semester/*',
              ...entryPointRoute(timetableEntryPoint, dispatch),
            },
            {
              path: '/',
              element: <TimetableRootRedirector />,
            },
          ],
        },
        {
          path: '/today',
          ...entryPointRoute(todayEntryPoint, dispatch),
        },
        {
          path: '/modules',
          ...entryPointRoute(moduleFinderEntryPoint, dispatch),
        },
        {
          path: '/modules/:moduleCode/*',
          ...entryPointRoute(modulePageEntryPoint, dispatch),
        },
        {
          path: '/archive/:moduleCode/:archiveYear/*',
          ...entryPointRoute(moduleArchiveEntryPoint, dispatch),
        },

        // 404 page
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ];
}

/**
 * Creates a route config from an array of JavaScript objects.
 *
 * Forked from an original React Router implementation to support entry points.
 *
 * @see https://reactrouter.com/api/createRoutesFromArray
 */
function createRoutesFromArray(array: EntryPointPartialRouteObject[]): EntryPointRouteObject[] {
  return array.map((partialRoute) => {
    const route: EntryPointRouteObject = {
      path: partialRoute.path || '/',
      caseSensitive: partialRoute.caseSensitive === true,
      element: partialRoute.element || <Outlet />,
      preload: partialRoute.preload,
      preloadCode: partialRoute.preloadCode,
    };

    if (partialRoute.children) {
      route.children = createRoutesFromArray(partialRoute.children);
    }

    return route;
  });
}

const Routes: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const routes = useMemo(() => createRoutesFromArray(createPartialRoutes(dispatch)), [dispatch]);
  const element = useRoutes(routes);
  return <RoutePreloaderProvider routes={routes}>{element}</RoutePreloaderProvider>;
};

export default memo(Routes);
