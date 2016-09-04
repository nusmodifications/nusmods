import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import requests from './requests';
import reddit from './reddit';
import entities from './entities';

export default combineReducers({
  entities,
  reddit,
  requests,
  routing: routerReducer,
});
