import type { ModuleList } from 'types/reducers';
import type { VenueList } from 'types/venues';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import produce from 'immer';
import { range } from 'lodash';
import configureStore from 'bootstrapping/configure-store';
import reducers from 'reducers';
import { initAction } from 'test-utils/redux';
import { mockDom, mockDomReset, mockWindowMatchMedia } from 'test-utils/mockDom';

import GlobalSearchContainer from 'views/layout/GlobalSearchContainer';
import { fetchVenueList } from 'actions/venueBank';

jest.mock('actions/venueBank');
const mockedFetchVenueList = fetchVenueList as jest.MockedFunction<typeof fetchVenueList>;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Produces 26 * 26 = 676 modules of the form AA1010, AB1010, ...
const MODULES: ModuleList = letters.flatMap((firstLetter) =>
  letters.map((secondLetter) => ({
    moduleCode: `${firstLetter}${secondLetter}1010`,
    title: 'Test',
    semesters: [1],
  })),
);

// Produces 26 venues of the form AA-1, BB-1, CC-1, ...
const VENUES: VenueList = letters.map((letter) => `${letter}${letter}-1`);

const relevantStoreContents = {
  moduleBank: { moduleList: MODULES },
  venueBank: { venueList: VENUES },
};

const initialState = reducers(undefined, initAction());

function make(storeOverrides: Partial<typeof relevantStoreContents> = {}) {
  const { store } = configureStore(
    produce(initialState, (draft) => {
      draft.moduleBank.moduleList = (storeOverrides.moduleBank?.moduleList ??
        relevantStoreContents.moduleBank.moduleList) as typeof draft.moduleBank.moduleList;
      draft.venueBank.venueList =
        storeOverrides.venueBank?.venueList ?? relevantStoreContents.venueBank.venueList;
    }),
  );

  return render(
    <MemoryRouter>
      <Provider store={store}>
        <GlobalSearchContainer />
      </Provider>
    </MemoryRouter>,
  );
}
describe('GlobalSearchContainer', () => {
  beforeEach(() => {
    mockDom();

    // Replace fetchVenueList with a noop action to stop it from firing API requests
    mockedFetchVenueList.mockImplementation(() => initAction() as never);
  });

  afterEach(() => {
    mockedFetchVenueList.mockReset();
    mockDomReset();
  });

  test('hides module when screen size is small', () => {
    mockWindowMatchMedia({ matches: false });
    const { container } = make();
    expect(container).toBeEmptyDOMElement();
  });

  test('fetches venue list', () => {
    expect(mockedFetchVenueList).not.toHaveBeenCalled();
    make();
    expect(mockedFetchVenueList).toHaveBeenCalled();
  });

  test('shows no choices when search is too short', () => {
    const { getByRole, queryAllByRole } = make();

    // Expect not to show choices when search string is too short
    userEvent.type(getByRole('textbox'), '1');
    expect(queryAllByRole('option')).toHaveLength(0);

    // Expect to show choices when search string is long enough
    userEvent.type(getByRole('textbox'), '1');
    expect(queryAllByRole('option')).not.toHaveLength(0);
  });

  test('shows at most 10 choices when there are many venues and modules', () => {
    const { getByRole, getAllByRole } = make();
    // Space is intentional - min chars needed to trigger search is 2, so you need an additional character.
    userEvent.type(getByRole('textbox'), '1 ');
    expect(getAllByRole('option').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
    Array [
      "View All Modules",
      "AA1010 Test Sem 1",
      "AB1010 Test Sem 1",
      "AC1010 Test Sem 1",
      "AD1010 Test Sem 1",
      "AE1010 Test Sem 1",
      "AF1010 Test Sem 1",
      "View All Venues",
      "AA-1",
      "BB-1",
      "CC-1",
      "DD-1",
    ]
  `);
  });

  test('prioritize showing venues when there are many venues even if there are modules', () => {
    const { getByRole, getAllByRole } = make({
      moduleBank: { moduleList: MODULES.slice(0, 5) },
    });
    userEvent.type(getByRole('textbox'), '1 ');
    expect(getAllByRole('option').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
    Array [
      "View All Venues",
      "AA-1",
      "BB-1",
      "CC-1",
      "DD-1",
      "EE-1",
      "FF-1",
      "GG-1",
      "HH-1",
      "II-1",
      "JJ-1",
      "KK-1",
      "LL-1",
      "MM-1",
      "NN-1",
      "OO-1",
      "PP-1",
      "QQ-1",
      "RR-1",
      "SS-1",
      "TT-1",
      "UU-1",
      "VV-1",
      "WW-1",
      "XX-1",
      "YY-1",
      "ZZ-1",
    ]
  `);
  });

  test('shows at most 10 choices when there are many modules', () => {
    const { getByRole, getAllByRole } = make({
      venueBank: { venueList: VENUES.slice(0, 2) },
    });
    userEvent.type(getByRole('textbox'), '1 ');
    expect(getAllByRole('option').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
    Array [
      "View All Modules",
      "AA1010 Test Sem 1",
      "AB1010 Test Sem 1",
      "AC1010 Test Sem 1",
      "AD1010 Test Sem 1",
      "AE1010 Test Sem 1",
      "AF1010 Test Sem 1",
      "AG1010 Test Sem 1",
      "AH1010 Test Sem 1",
      "View All Venues",
      "AA-1",
      "BB-1",
    ]
  `);
  });

  test('shows all results when there are few', () => {
    const { getByRole, getAllByRole } = make();
    userEvent.type(getByRole('textbox'), 'AA');
    expect(getAllByRole('option').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
    Array [
      "View All Modules",
      "AA1010 Test Sem 1",
      "View All Venues",
      "AA-1",
    ]
  `);
  });

  test('show many results if the search only returns modules', () => {
    const { getByRole, getAllByRole } = make({
      venueBank: { venueList: range(100).map((n) => `Venue ${n}`) },
    });

    userEvent.type(getByRole('textbox'), '1010');
    expect(getAllByRole('option').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
    Array [
      "View All Modules",
      "AA1010 Test Sem 1",
      "AB1010 Test Sem 1",
      "AC1010 Test Sem 1",
      "AD1010 Test Sem 1",
      "AE1010 Test Sem 1",
      "AF1010 Test Sem 1",
      "AG1010 Test Sem 1",
      "AH1010 Test Sem 1",
      "AI1010 Test Sem 1",
      "AJ1010 Test Sem 1",
      "AK1010 Test Sem 1",
      "AL1010 Test Sem 1",
      "AM1010 Test Sem 1",
      "AN1010 Test Sem 1",
      "AO1010 Test Sem 1",
      "AP1010 Test Sem 1",
      "AQ1010 Test Sem 1",
      "AR1010 Test Sem 1",
      "AS1010 Test Sem 1",
      "AT1010 Test Sem 1",
      "AU1010 Test Sem 1",
      "AV1010 Test Sem 1",
      "AW1010 Test Sem 1",
      "AX1010 Test Sem 1",
      "AY1010 Test Sem 1",
      "AZ1010 Test Sem 1",
      "BA1010 Test Sem 1",
      "BB1010 Test Sem 1",
      "BC1010 Test Sem 1",
      "BD1010 Test Sem 1",
      "BE1010 Test Sem 1",
      "BF1010 Test Sem 1",
      "BG1010 Test Sem 1",
      "BH1010 Test Sem 1",
      "BI1010 Test Sem 1",
      "BJ1010 Test Sem 1",
      "BK1010 Test Sem 1",
      "BL1010 Test Sem 1",
      "BM1010 Test Sem 1",
      "BN1010 Test Sem 1",
      "BO1010 Test Sem 1",
      "BP1010 Test Sem 1",
      "BQ1010 Test Sem 1",
      "BR1010 Test Sem 1",
      "BS1010 Test Sem 1",
      "BT1010 Test Sem 1",
      "BU1010 Test Sem 1",
      "BV1010 Test Sem 1",
      "BW1010 Test Sem 1",
      "BX1010 Test Sem 1",
      "BY1010 Test Sem 1",
      "BZ1010 Test Sem 1",
      "CA1010 Test Sem 1",
      "CB1010 Test Sem 1",
      "CC1010 Test Sem 1",
      "CD1010 Test Sem 1",
      "CE1010 Test Sem 1",
      "CF1010 Test Sem 1",
      "CG1010 Test Sem 1",
      "CH1010 Test Sem 1",
      "CI1010 Test Sem 1",
      "CJ1010 Test Sem 1",
      "CK1010 Test Sem 1",
      "CL1010 Test Sem 1",
      "CM1010 Test Sem 1",
      "CN1010 Test Sem 1",
      "CO1010 Test Sem 1",
      "CP1010 Test Sem 1",
      "CQ1010 Test Sem 1",
      "CR1010 Test Sem 1",
    ]
  `);
  });

  test('show many results if the search only returns venues', () => {
    const { getByRole, getAllByRole } = make({
      venueBank: { venueList: range(100).map((n) => `Venue ${n}`) },
    });

    userEvent.type(getByRole('textbox'), 'venue');
    expect(getAllByRole('option').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
    Array [
      "View All Venues",
      "Venue 0",
      "Venue 1",
      "Venue 2",
      "Venue 3",
      "Venue 4",
      "Venue 5",
      "Venue 6",
      "Venue 7",
      "Venue 8",
      "Venue 9",
      "Venue 10",
      "Venue 11",
      "Venue 12",
      "Venue 13",
      "Venue 14",
      "Venue 15",
      "Venue 16",
      "Venue 17",
      "Venue 18",
      "Venue 19",
      "Venue 20",
      "Venue 21",
      "Venue 22",
      "Venue 23",
      "Venue 24",
      "Venue 25",
      "Venue 26",
      "Venue 27",
      "Venue 28",
      "Venue 29",
      "Venue 30",
      "Venue 31",
      "Venue 32",
      "Venue 33",
      "Venue 34",
      "Venue 35",
      "Venue 36",
      "Venue 37",
      "Venue 38",
      "Venue 39",
      "Venue 40",
      "Venue 41",
      "Venue 42",
      "Venue 43",
      "Venue 44",
      "Venue 45",
      "Venue 46",
      "Venue 47",
      "Venue 48",
      "Venue 49",
      "Venue 50",
      "Venue 51",
      "Venue 52",
      "Venue 53",
      "Venue 54",
      "Venue 55",
      "Venue 56",
      "Venue 57",
      "Venue 58",
      "Venue 59",
      "Venue 60",
      "Venue 61",
      "Venue 62",
      "Venue 63",
      "Venue 64",
      "Venue 65",
      "Venue 66",
      "Venue 67",
      "Venue 68",
      "Venue 69",
    ]
  `);
  });
});
