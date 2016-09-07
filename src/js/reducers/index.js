import { routerReducer } from 'react-router-redux';

import requests from './requests';
import entities from './entities';
import timetables from './timetables';

export default function (state = {}, action) {
  return {
    entities: entities(state.entities, action),
    requests: requests(state.requests, action),
    timetables: timetables(state.timetables, action, state.entities),
    routing: routerReducer(state.routing, action),
  };
}
