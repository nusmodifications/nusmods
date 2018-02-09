// @flow
import type { Middleware } from 'redux';
import { mapValues, values, flatten, fromPairs, pick } from 'lodash';
import { firestore, auth } from 'utils/firebase/firebase';
import { syncDataReceived } from 'actions/sync';

const SYNC_COLLECTION_NAME = 'mods';

export type SyncConfig = {
  actions: string[], // Action types to watch for
  keyPaths?: string[], // Key paths to send to server. If absent, sends entire reducer state
};

export type PerReducerSyncConfig = { [string]: SyncConfig };

// Returns a map of action types to reducer names.
// No two reducers should watch for the same action.
export function mapActionsToReducers(config: PerReducerSyncConfig): { [string]: string } {
  return fromPairs(
    flatten(
      values(
        // Create { reducerName: [[actionType, reducerName]] } object
        mapValues(config, (syncConfig, reducerName) =>
          syncConfig.actions.map((actionType) => [actionType, reducerName]),
        ),
      ),
    ),
  );
}

export default function createSyncMiddleware(perReducerConfig: PerReducerSyncConfig) {
  let unsubscribeSync: ?Function; // Function to stop subscribing to Firebase update snapshots
  const actionToReducerMap = mapActionsToReducers(perReducerConfig);

  const syncMiddleware: Middleware<*, *, *> = (store) => {
    auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        unsubscribeSync = firestore
          .collection(SYNC_COLLECTION_NAME)
          .doc(user.uid)
          .onSnapshot(
            (doc) => {
              // Ignore docs that don't exist
              if (!doc.exists) return;
              // Ignore changes that originated locally
              // https://firebase.google.com/docs/firestore/query-data/listen#events-local-changes
              if (doc.metadata.hasPendingWrites) return;
              store.dispatch(syncDataReceived(doc.data()));
            },
            // TODO: Handle errors properly
            (err) => alert(`Subscription error ${err}`),
          );
      } else {
        // No user is signed in.
        // eslint-disable-next-line no-lonely-if
        if (unsubscribeSync) unsubscribeSync();
      }
    });

    return (next) => (action) => {
      const result = next(action);

      // Send state if logged in and action is watched
      const newState = store.getState();
      const loggedInUser = auth().currentUser;
      const reducerName = actionToReducerMap[action.type];
      if (loggedInUser && reducerName) {
        const config = perReducerConfig[reducerName];
        const reducerState = newState[reducerName];
        const stateToSend = config.keyPaths ? pick(reducerState, config.keyPaths) : reducerState;
        // TODO: Consider diffing state to only send changed fields

        // Send data to server
        firestore
          .collection(SYNC_COLLECTION_NAME)
          .doc(loggedInUser.uid)
          .set({ [reducerName]: stateToSend }, { merge: true })
          // .then(() => console.log("My god Jim, we've synced@!", stateToSend));
          // TODO: Handle errors properly
          .catch((err) => alert(`Send error ${err}`));
      }

      return result;
    };
  };

  return syncMiddleware;
}
