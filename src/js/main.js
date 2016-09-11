import ReactDOM from 'react-dom';
import _ from 'lodash';
import { useRouterHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { createHistory } from 'history';
import configureStore from 'stores/configure-store';

import routes from 'routes';
import storage from 'storage';

require('main.scss');

const persistedState = storage.loadState();
const store = configureStore(persistedState);
store.subscribe(_.throttle(() => {
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
  });
}, 1000));

const history = syncHistoryWithStore(useRouterHistory(createHistory)({
  basename: '/',
}), store);

ReactDOM.render(routes({ store, history }),
  document.getElementById('app'));
