// Import Sentry earliest to capture exceptions
import 'bootstrapping/sentry';
// core-js has issues with Promise feature detection on Edge, and hence
// polyfills Promise incorrectly. Importing this polyfill directly resolves that.
// This is necessary as PersistGate used in ./App uses `Promise.prototype.finally`.
// See: https://github.com/zloirock/core-js/issues/579#issuecomment-504325213
import 'core-js/es/promise/finally';

import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';

import configureStore from 'bootstrapping/configure-store';
import subscribeOnlineEvents from 'bootstrapping/subscribeOnlineEvents';
import { initializeMamoto } from 'bootstrapping/matomo';
import registerServiceWorker from 'bootstrapping/service-worker-manager';

import 'styles/main.scss';

import App from './App';

const { store, persistor } = configureStore();

subscribeOnlineEvents(store);

// Initialize ReactModal
ReactModal.setAppElement('#app');

ReactDOM.render(<App store={store} persistor={persistor} />, document.getElementById('app'));

if (
  ((NUSMODS_ENV === 'preview' || NUSMODS_ENV === 'staging' || NUSMODS_ENV === 'production') &&
    'serviceWorker' in navigator &&
    window.location.protocol === 'https:') ||
  // Allow us to force service worker to be enabled for debugging
  DEBUG_SERVICE_WORKER
) {
  registerServiceWorker(store);
}

if (NUSMODS_ENV === 'production') {
  initializeMamoto();
}
