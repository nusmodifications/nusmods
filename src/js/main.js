import ReactDOM from 'react-dom';
import { useRouterHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { createHistory } from 'history';

import routes from 'routes';
import configureStore from 'stores/configure-store';

require('main.scss');

const store = configureStore();
const history = syncHistoryWithStore(useRouterHistory(createHistory)({
  basename: '/',
}), store);

ReactDOM.render(routes(store, history),
  document.getElementById('app'));
