import 'utils/polyfill';

import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import Raven from 'raven-js';

import configureStore from 'stores/configure-store';
import subscribeOnlineEvents from 'stores/subscribeOnlineEvents';
import initKeyboardShortcuts from 'utils/keyboardShortcuts';
import storage from 'storage';
import App from 'App';

import 'utils/sentry';
import initializeGA from 'utils/google-analytics';

import '../styles/main.scss';

const persistedState = storage.loadState();
const { store, persistor } = configureStore(persistedState);

subscribeOnlineEvents(store);
initKeyboardShortcuts(store);

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
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      Raven.captureException(e);
    });
  }

  initializeGA();
}
