// Import Sentry earliest to capture exceptions
import 'bootstrapping/sentry';
import 'bootstrapping/browser';

import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';

import App from 'App';

import configureStore from 'bootstrapping/configure-store';
import subscribeOnlineEvents from 'bootstrapping/subscribeOnlineEvents';
import { initializeMamoto } from 'bootstrapping/matomo';
import registerServiceWorker from 'bootstrapping/service-worker-manager';

import 'styles/main.scss';

const { store, persistor } = configureStore();

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
  // Allow us to force service worker to be enabled for debugging
  process.env.DEBUG_SERVICE_WORKER
) {
  registerServiceWorker(store);
}

if (process.env.NODE_ENV === 'production') {
  initializeMamoto();
}
