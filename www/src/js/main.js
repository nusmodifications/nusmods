import 'bootstrapping/polyfill';

// Import Sentry earliest to capture exceptions
import 'bootstrapping/sentry';
import 'bootstrapping/browser';

import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import Raven from 'raven-js';

import App from 'App';

import configureStore from 'bootstrapping/configure-store';
import subscribeOnlineEvents from 'bootstrapping/subscribeOnlineEvents';
import initKeyboardShortcuts from 'bootstrapping/keyboardShortcuts';
import initializeGA from 'bootstrapping/google-analytics';

import '../styles/main.scss';

// If the page is server side rendered, the REDUX_STATE variable would be
// available and contain the state of store on the server side
const persistedState = window.REDUX_STATE || {};
const { store, persistor } = configureStore(persistedState);

subscribeOnlineEvents(store);
initKeyboardShortcuts(store);

// Initialize ReactModal
ReactModal.setAppElement('#app');

const render = () => {
  const app = App({ store, persistor });
  const container = document.getElementById('app');

  if (window.REDUX_STATE) {
    ReactDOM.hydrate(app, container);
  } else {
    ReactDOM.render(app, container);
  }
};

if (module.hot) {
  module.hot.accept('App', render);
}

render();

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      Raven.captureException(e);
    });
  }

  initializeGA();
}
