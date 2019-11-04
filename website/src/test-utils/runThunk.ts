import { Actions } from 'types/actions';

export default async function runThunk(
  action: Actions | Function,
  dispatch: Function,
  getState: Function = () => {},
) {
  if (typeof action === 'function') {
    const p = action(
      (nextAction: Actions | Function) => runThunk(nextAction, dispatch, getState),
      getState,
    );

    if (p instanceof Promise) {
      await p;
    }
  } else {
    dispatch(action);
  }
}
