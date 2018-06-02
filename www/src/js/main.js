import 'bootstrapping/polyfill';

// Import Sentry earliest to capture exceptions
import 'bootstrapping/sentry';
import 'bootstrapping/browser';

import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import Raven from 'raven-js';

import App from 'App';
import storage from 'storage';

import configureStore from 'bootstrapping/configure-store';
import subscribeOnlineEvents from 'bootstrapping/subscribeOnlineEvents';
import initializeGA from 'bootstrapping/google-analytics';

import '../styles/main.scss';

const persistedState = storage.loadState();
const { store, persistor } = configureStore(persistedState);

subscribeOnlineEvents(store);

// Initialize ReactModal
ReactModal.setAppElement('#app');

const render = () => {
  ReactDOM.render(App({ store, persistor }), document.getElementById('app'));
};

if (module.hot) {
  module.hot.accept('App', render);
}

render();

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/service-worker.js').catch((e) => {
      Raven.captureException(e);
    });
  }

  initializeGA();
}
