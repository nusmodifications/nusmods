import { combineReducers } from 'redux';
import requests from './requests';
import counter from './counter';
import reddit from './reddit';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  counter,
  reddit,
  requests,
  routing: routerReducer
});
