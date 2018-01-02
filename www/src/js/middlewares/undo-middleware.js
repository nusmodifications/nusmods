import { pick } from 'lodash';
import { pushNewPresentState, actionsToPersist, keyPathsToPersist } from 'reducers/undoHistory';

// Middleware that watches for un/redoable actions and
// pushes the state after they're run to history
export default (store) => (next) => (action) => {
  // Ignore if action should not be recorded
  if (!actionsToPersist.includes(action.type)) return next(action);

  // Get new state before and after action is performed
  const relevantBefore = pick(store.getState(), keyPathsToPersist);
  const result = next(action);
  const relevantAfter = pick(store.getState(), keyPathsToPersist);

  // Send to undoHistory reducer
  store.dispatch(pushNewPresentState(relevantBefore, relevantAfter));

  return result;
};
