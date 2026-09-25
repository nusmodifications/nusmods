import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { produce } from 'immer';

import type { Dispatch } from 'types/redux';

import { FETCH_MODULE, FETCH_MODULE_LIST } from 'actions/constants';
import { addTimetableSlot, setTimetable } from 'actions/timetables';
import configureStore from 'bootstrapping/configure-store';
import { SUCCESS_KEY } from 'middlewares/requests-middleware';
import reducers from 'reducers';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import { initAction } from 'test-utils/redux';

import { CS1010S, CS3216 } from '__mocks__/modules';
import modulesList from '__mocks__/moduleList.json';

import TimetableSlotsCompare from './TimetableSlotsCompare';

const initialState = reducers(undefined, initAction());

async function makeCompare(slotIds: [string, string] = ['0', '1']) {
  const { store } = configureStore(produce(initialState, () => {}));
  store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE_LIST), payload: modulesList });
  store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE), payload: CS1010S });
  store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE), payload: CS3216 });

  // Slot '0' holds CS1010S; slot '1' (active) holds CS3216
  await act(async () => {
    (store.dispatch as Dispatch)(setTimetable(1, { CS1010S: { Lecture: ['1'] } }));
    store.dispatch(addTimetableSlot(1));
    (store.dispatch as Dispatch)(setTimetable(1, { CS3216: { Lecture: ['1'] } }));
  });

  const onSelectSlot = vi.fn();
  const onExit = vi.fn();

  const view = render(
    <Provider store={store}>
      <TimetableSlotsCompare
        semester={1}
        slotIds={slotIds}
        onSelectSlot={onSelectSlot}
        onExit={onExit}
      />
    </Provider>,
  );

  return { store, onSelectSlot, onExit, ...view };
}

describe(TimetableSlotsCompare, () => {
  beforeEach(() => mockDom());
  afterEach(() => mockDomReset());

  test('should render two read-only timetable grids for the chosen slots', async () => {
    const { container } = await makeCompare();

    expect(container.querySelectorAll('.timetable')).toHaveLength(2);
    // Slot 0's module and the active slot's module both appear
    expect(screen.getByText(/CS1010S/)).toBeInTheDocument();
    expect(screen.getByText(/CS3216/)).toBeInTheDocument();
  });

  test('should show slot titles in the pane pickers', async () => {
    await makeCompare();

    const pickers = screen.getAllByRole('combobox');
    expect(pickers).toHaveLength(2);
    expect(pickers[0]).toHaveValue('0');
    expect(pickers[1]).toHaveValue('1');
  });

  test('should notify when a different slot is picked for a pane', async () => {
    const { onSelectSlot } = await makeCompare();

    const [firstPicker] = screen.getAllByRole('combobox');
    fireEvent.change(firstPicker, { target: { value: '1' } });

    expect(onSelectSlot).toHaveBeenCalledWith(0, '1');
  });

  test('should switch to the pane slot and exit when "Use this timetable" is clicked', async () => {
    const { store, onExit } = await makeCompare();

    // The active slot's pane shows a disabled "Current timetable" button instead
    expect(screen.getByRole('button', { name: 'Current timetable' })).toBeDisabled();

    const useButton = screen.getByRole('button', { name: 'Use this timetable' });
    // switchTimetableSlot fetches the slot's modules before dispatching the
    // switch, so the state update settles asynchronously after the click
    await act(async () => {
      fireEvent.click(useButton);
    });
    await waitFor(() => expect(store.getState().timetables.activeSlot[1]).toBe('0'));

    // validateTimetable (run as part of the switch) fills in any of
    // CS1010S's other required lesson types alongside the Lecture selection
    // from the slot - so only assert the selection we set is preserved
    expect(store.getState().timetables.lessons[1]).toMatchObject({
      CS1010S: expect.objectContaining({ Lecture: ['1'] }),
    });
    expect(onExit).toHaveBeenCalled();
  });

  test('should exit compare mode from the close button', async () => {
    const { onExit } = await makeCompare();

    fireEvent.click(screen.getByRole('button', { name: /Exit comparison/ }));
    expect(onExit).toHaveBeenCalled();
  });
});
