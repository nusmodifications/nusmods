// @flow
import { firebase } from '@firebase/app';

if (!firebase.apps.length) {
  firebase.initializeApp(
    {
      apiKey: 'AIzaSyDyExdop0njbfcRSLbk7l3JTUsPAjS5W_8',
      authDomain: 'api-project-889500375187.firebaseapp.com',
      projectId: 'api-project-889500375187',
    },
    'covfefef',
  );
}

export default firebase;
