import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import requests from './requests';
import entities from './entities';

export default combineReducers({
  entities,
  requests,
  routing: routerReducer,
});
