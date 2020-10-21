import type { Location, History } from 'history';

import { useContext, useMemo } from 'react';

// FIXME: Find a way to replace this with useMutableSource if possible;
// useSubscription may tear. See
// https://gist.github.com/bvaughn/054b82781bec875345bd85a5b1344698
import { useSubscription, Subscription } from 'use-subscription';

import RoutingContext from './RoutingContext';

export function useHistory() {
  const router = useContext(RoutingContext);
  if (!router) {
    throw new Error('You should not use useHistory outside a <RoutingContext>');
  }

  const subscription = useMemo<Subscription<History>>(
    () => ({
      getCurrentValue: () => router.history,
      subscribe(callback) {
        const dispose = router.subscribe(callback);
        return () => dispose();
      },
    }),
    [router],
  );
  const history = useSubscription(subscription);

  return history;
}

export function useLocation() {
  const router = useContext(RoutingContext);
  if (!router) {
    throw new Error('You should not use useLocation outside a <RoutingContext>');
  }

  const subscription = useMemo<Subscription<Location>>(
    () => ({
      getCurrentValue: () => router.history.location,
      subscribe(callback) {
        const dispose = router.subscribe(callback);
        return () => dispose();
      },
    }),
    [router],
  );
  const location = useSubscription(subscription);

  return location;
}
