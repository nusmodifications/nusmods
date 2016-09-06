import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import requests from './requests';
import entities from './entities';
import timetables from './timetables';

export default combineReducers({
  entities,
  requests,
  timetables,
  routing: routerReducer,
});
