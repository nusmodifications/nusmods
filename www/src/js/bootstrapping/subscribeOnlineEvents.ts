// @flow
import type { Store } from 'redux';
import { setOnlineStatus } from 'actions/app';

export default function subscribeOnlineEvents(store: Store<*, *, *>) {
  const updateOnlineStatus = () => {
    store.dispatch(setOnlineStatus(navigator.onLine));
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
}
