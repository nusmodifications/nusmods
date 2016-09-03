import { combineReducers } from 'redux';
import counter from './counter';
import counterDouble from './counter-double';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  counter,
  counterDouble,
  routing: routerReducer
});
