import { pick } from 'lodash';
import { pushNewPresentState, actionsToPersist, keyPathsToPersist } from 'reducers/undoHistory';

// Middleware that watches for un/redoable actions and
// pushes the state after they're run to history
export default (store) => (next) => (action) => {
  // Ignore if action should not be recorded
  if (!actionsToPersist.includes(action.type)) return next(action);

  // Save new state after action is performed
  const result = next(action);
  const persist = pick(store.getState(), keyPathsToPersist);
  store.dispatch(pushNewPresentState(persist));
  return result;
};
