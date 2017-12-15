import 'utils/polyfill';

import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import _ from 'lodash';
import Raven from 'raven-js';

import configureStore from 'stores/configure-store';
import storage from 'storage';
import App from 'App';

import 'utils/sentry';
import '../styles/main.scss';

const persistedState = storage.loadState();
const store = configureStore(persistedState);
store.subscribe(
  _.debounce(() => {
    const storeState = store.getState();
    // TODO: Possibly write our own utility pickNestedKeys function to
    //       pick out the keys (including nested keys) from the store
    //       that we want to persist.
    storage.saveState({
      entities: {
        moduleBank: {
          modules: storeState.entities.moduleBank.modules,
          moduleList: storeState.entities.moduleBank.moduleList,
        },
      },
      timetables: storeState.timetables,
      theme: storeState.theme,
      settings: storeState.settings,
      // Don't persist app key as app state should be ephemeral.
    });
  }, 1000),
);

ReactModal.setAppElement('#app');
const render = () => {
  ReactDOM.render(App({ store }), document.getElementById('app'));
};

if (module.hot) {
  module.hot.accept('App', render);
}

render();

if (process.env.NODE_ENV === 'production') {
  if (navigator.serviceWorker && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js')
      .catch((e) => {
        Raven.captureException(e);
      });
  }
}
