import 'bootstrapping/polyfill';

// Import Sentry earliest to capture exceptions
import 'bootstrapping/sentry';
import 'bootstrapping/browser';

import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';

import App from 'App';
import storage from 'storage';

import configureStore from 'bootstrapping/configure-store';
import subscribeOnlineEvents from 'bootstrapping/subscribeOnlineEvents';
import initializeGA from 'bootstrapping/google-analytics';
import initializeServiceWorker from 'bootstrapping/service-worker';

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

if (
  ('serviceWorker' in navigator &&
    window.location.protocol === 'https:' &&
    process.env.NODE_ENV === 'production') ||
  // Allow us to force Workbox to be enabled for debugging
  process.env.DEBUG_WORKBOX
) {
  initializeServiceWorker(store);
}

if (process.env.NODE_ENV === 'production') {
  initializeGA();
}
