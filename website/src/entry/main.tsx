/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

// Import Sentry earliest to capture exceptions
import 'bootstrapping/sentry';
// core-js has issues with Promise feature detection on Edge, and hence
// polyfills Promise incorrectly. Importing this polyfill directly resolves that.
// This is necessary as PersistGate used in ./App uses `Promise.prototype.finally`.
// See: https://github.com/zloirock/core-js/issues/579#issuecomment-504325213
import 'core-js/es/promise/finally';

import { unstable_createRoot as createRoot } from 'react-dom';
import ReactModal from 'react-modal';

import configureStore from 'bootstrapping/configure-store';
import subscribeOnlineEvents from 'bootstrapping/subscribeOnlineEvents';
import { initializeMamoto } from 'bootstrapping/matomo';
import registerServiceWorker from 'bootstrapping/service-worker-manager';

import 'styles/main.scss';

import App from './App';

const { store, persistor } = configureStore();

subscribeOnlineEvents(store);

const root = document.getElementById('app');
if (!root) {
  throw new Error('Could not find root #app element!');
}

// Initialize ReactModal
ReactModal.setAppElement(root);

createRoot(root).render(<App store={store} persistor={persistor} />);

if (
  (!__DEV__ &&
    !__TEST__ &&
    'serviceWorker' in navigator &&
    window.location.protocol === 'https:') ||
  // Allow us to force service worker to be enabled for debugging
  DEBUG_SERVICE_WORKER
) {
  registerServiceWorker(store);
}

if (!__DEV__ && !__TEST__) {
  initializeMamoto();
}
