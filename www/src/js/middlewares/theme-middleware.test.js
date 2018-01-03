// @flow
import { setColorMap } from 'actions/theme';
import themeMiddleware from './theme-middleware';

function applyMiddleware(before, after) {
  const dispatch = jest.fn();
  const store: any = {
    dispatch,
    getState: () => before,
  };

  const next = () => {
    store.getState = () => after;
  };

  const action = {};

  themeMiddleware(store)(next)(action);
  return dispatch;
}

const anyNumber: number = (expect.any(Number): any);

/* eslint-disable no-useless-computed-key */
test('not do anything if timetable is not changed', () => {
  const timetables = {};
  const dispatch = applyMiddleware({ timetables, count: 1 }, { timetables, count: 2 });
  expect(dispatch).not.toBeCalled();
});

test('add colors when modules are added', () => {
  const before = { [1]: {} };
  const after = { [1]: { CS1010S: {}, CS2105: {} }, [2]: { CS3217: {} } };
  const colors = { CS3217: 2 };

  const dispatch = applyMiddleware(
    { timetables: before },
    { timetables: after, theme: { colors } },
  );

  expect(dispatch).toBeCalledWith(
    setColorMap({
      CS2105: anyNumber,
      CS1010S: anyNumber,
      CS3217: 2,
    }),
  );
});

test('remove colors when modules are removed', () => {
  const before = { [1]: { CS1010S: {}, CS2105: {} }, [2]: { CS3217: {} } };
  const after = { [2]: { CS3217: {} } };
  const colors = { CS3217: 2, CS1010S: 1, CS2105: 0 };

  const dispatch = applyMiddleware(
    { timetables: before },
    { timetables: after, theme: { colors } },
  );

  expect(dispatch).toBeCalledWith(
    setColorMap({
      CS3217: 2,
    }),
  );
});

test('reuse existing colors', () => {
  const before = { [1]: { CS3216: {} }, [2]: { CS1010S: {} } };
  const after = { [1]: { CS3216: {}, CS1010S: {} }, [2]: { CS1010S: {} } };
  const colors = { CS1010S: 0, CS3216: 0 };

  const dispatch = applyMiddleware(
    { timetables: before },
    { timetables: after, theme: { colors } },
  );

  expect(dispatch).toBeCalledWith(
    setColorMap({
      CS3216: 0,
      CS1010S: 0,
    }),
  );
});
