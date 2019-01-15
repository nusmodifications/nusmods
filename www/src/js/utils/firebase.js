// @flow
import { firebase } from '@firebase/app';
import '@firebase/auth';
import '@firebase/firestore';

export const SYNC_COLLECTION_NAME = 'mods';

if (!firebase.apps.length) {
  firebase.initializeApp({
    // TODO: Use process.env instead
    apiKey: 'AIzaSyDyExdop0njbfcRSLbk7l3JTUsPAjS5W_8',
    authDomain: 'api-project-889500375187.firebaseapp.com',
    projectId: 'api-project-889500375187',
  });
}

export default firebase;
export const auth = firebase.auth;
export const firestore = firebase.firestore;
