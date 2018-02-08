// @flow
import { mapValues, values, flatten, fromPairs, pick } from 'lodash';
import { firestore } from 'utils/firebase/firebase';
import { AUTH_LOGIN, AUTH_LOGOUT } from 'actions/auth';

const SYNC_COLLECTION_NAME = 'mods';

export type SyncConfig = {
  actions: string[],
  keyPaths?: string[],
};

// Returns a map of action types to reducer names.
// No two reducers should watch for the same action.
export function mapActionsToReducers(config: { string: SyncConfig }): { string: string } {
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

export default function createSyncMiddleware(perReducerConfig: { string: SyncConfig }) {
  let unsubscribeSync; // Function to stop subscribing to Firebase update snapshots
  const actionToReducerMap = mapActionsToReducers(perReducerConfig);

  return (store) => (next) => (action) => {
    switch (action.type) {
      case AUTH_LOGIN: {
        console.log('Listening for users data', action.payload.user.uid);
        unsubscribeSync = firestore
          .collection(SYNC_COLLECTION_NAME)
          .doc(action.payload.user.uid)
          .onSnapshot((doc) => doc.data()); // TODO: Dispatch sync data received action
        break;
      }
      case AUTH_LOGOUT: {
        if (unsubscribeSync) unsubscribeSync();
        break;
      }
      default: {
        break;
      }
    }

    next(action);

    // Send state if logged in and action is watched
    const newState = store.getState();
    const loggedIn = newState.auth.loggedIn;
    const reducerName = actionToReducerMap[action.type];
    if (loggedIn && reducerName) {
      const config = perReducerConfig[reducerName];
      const reducerState = newState[reducerName];
      const stateToSend = config.keyPaths ? pick(reducerState, config.keyPaths) : reducerState;
      // TODO: Consider diffing state to only send changed fields

      // Send data to server
      const uid = newState.auth.user.uid;
      firestore
        .collection(SYNC_COLLECTION_NAME)
        .doc(uid)
        .set({ [reducerName]: stateToSend }, { merge: true });
      // .then(() => console.log("My god Jim, we've synced@!", stateToSend));
      // TODO: Handle errors
    }
  };
}
