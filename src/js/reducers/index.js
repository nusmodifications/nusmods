import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import requests from './requests';
import counter from './counter';
import reddit from './reddit';

export default combineReducers({
  counter,
  reddit,
  requests,
  routing: routerReducer,
});
