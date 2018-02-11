// @flow
import type { Middleware } from 'redux';
import type { PerReducerSyncConfig } from 'types/sync';
import { mapValues, values, flatten, fromPairs, pick } from 'lodash';
import { firestore, auth, SYNC_COLLECTION_NAME } from 'utils/firebase';
import { syncDataReceived } from 'actions/sync';

// Returns a map of action types to reducer names.
// No two reducers should watch for the same action.
// Exported for unit tests.
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

function startReceivingState(uid: string, onDataReceived: (data: Object) => mixed): Function {
  return firestore()
    .collection(SYNC_COLLECTION_NAME)
    .doc(uid)
    .onSnapshot(
      (doc) => {
        // Ignore docs that don't exist
        if (!doc.exists) return;
        // Ignore changes that originated locally. May be unreliable.
        // https://firebase.google.com/docs/firestore/query-data/listen#events-local-changes
        if (doc.metadata.hasPendingWrites) return;
        onDataReceived(doc.data());
      },
      // TODO: Handle errors properly
      (err) => alert(`Receive error ${err}`),
    );
}

function sendStateToServer(reducerName: string, stateToSend: Object) {
  const loggedInUser = auth().currentUser;

  const docToSend = {
    [reducerName]: stateToSend,
    updateTimestamp: firestore.FieldValue.serverTimestamp(),
    appVersion: process.env.versionStr,
  };

  const doc = firestore()
    .collection(SYNC_COLLECTION_NAME)
    .doc(loggedInUser.uid);

  doc
    // update() > set(..., { merge:true }) as update completely replaces a reducer's state
    .update(docToSend)
    // .update does not create docs when they do not exist.
    // We therefore catch not-found errors and call .set instead.
    .catch((err: firestore.FirestoreError) => {
      if (err.code !== 'not-found') throw err;
      return doc.set(docToSend);
    })
    // .then(() => console.log("Sent data!", stateToSend))
    // TODO: Handle errors properly
    .catch((err: firestore.FirestoreError) => alert(`Send error ${err}`));
}

export default function createSyncMiddleware(perReducerConfig: PerReducerSyncConfig) {
  let unsubscribeSync: ?Function; // Function to stop subscribing to Firebase update snapshots
  const actionToReducerMap = mapActionsToReducers(perReducerConfig);

  const syncMiddleware: Middleware<*, *, *> = (store) => {
    auth().onAuthStateChanged((user) => {
      // Unsubscribe if user logged out, or logged in to another account while already logged in
      if (unsubscribeSync) {
        unsubscribeSync();
        unsubscribeSync = null;
      }

      // Subscribe if user logged in
      if (user) {
        unsubscribeSync = startReceivingState(user.uid, (data) =>
          store.dispatch(syncDataReceived(data)),
        );
      }
    });

    return (next) => (action) => {
      const result = next(action);
      // Send state if logged in and action is watched
      const loggedInUser = auth().currentUser;
      const reducerName = actionToReducerMap[action.type];
      if (loggedInUser && reducerName) {
        const config = perReducerConfig[reducerName];
        const reducerState = store.getState()[reducerName];
        const stateToSend = config.keyPaths ? pick(reducerState, config.keyPaths) : reducerState;
        sendStateToServer(reducerName, stateToSend);
      }

      return result;
    };
  };

  return syncMiddleware;
}
