// @flow
import { firebase } from '@firebase/app';
import '@firebase/auth';
import '@firebase/firestore';

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyDyExdop0njbfcRSLbk7l3JTUsPAjS5W_8',
    authDomain: 'api-project-889500375187.firebaseapp.com',
    projectId: 'api-project-889500375187',
  });
}

export default firebase;
export const auth = firebase.auth;
export const firestore = firebase.firestore();
