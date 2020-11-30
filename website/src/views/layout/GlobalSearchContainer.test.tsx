import { shallow } from 'enzyme';
import _ from 'lodash';

import { ModuleCondensed } from 'types/modules';
import { SearchContainerComponent } from 'views/layout/GlobalSearchContainer';
import createHistory from 'test-utils/createHistory';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Produces 26 * 26 = 676 modules of the form AA1010, AB1010, ...
const MODULES = _.flatMap(letters, (firstLetter): ModuleCondensed[] =>
  letters.map((secondLetter) => ({
    moduleCode: `${firstLetter}${secondLetter}1010`,
    title: 'Test',
    semesters: [1],
  })),
);

// Produces 26 venues of the form AA-1, BB-1, CC-1, ...
const VENUES = letters.map((letter) => `${letter}${letter}-1`);

function make(props = {}) {
  const allProps = {
    matchBreakpoint: true,
    fetchVenueList: jest.fn(),
    moduleList: MODULES,
    venueList: VENUES,
    ...createHistory(),
    ...props,
  };

  return shallow(<SearchContainerComponent {...allProps} />);
}

test('hides module when screen size is small', () => {
  expect(make().isEmptyRender()).toBeFalsy();
  expect(make({ matchBreakpoint: false }).isEmptyRender()).toBeTruthy();
});

test('fetches venue list', () => {
  const mock = jest.fn();
  make({ fetchVenueList: mock });
  expect(mock).toHaveBeenCalled();
});

test('shows no choices when search is too short', () => {
  const instance = make().instance() as SearchContainerComponent;
  expect(instance.getResults('1')).toBeNull();
});

test('passes down search tokens', () => {
  const instance = make().instance() as SearchContainerComponent;
  expect(instance.getResults('ab')!.tokens).toEqual(['ab']);
  expect(instance.getResults('a b')!.tokens).toEqual(['a', 'b']);
  expect(instance.getResults('a, b')!.tokens).toEqual(['a', 'b']);
  expect(instance.getResults(' a, b ')!.tokens).toEqual(['a', 'b']);
});

test('shows at most 10 choices when there are many venues and modules', () => {
  const instance = make().instance() as SearchContainerComponent;
  const { modules, venues } = instance.getResults('1 ')!;
  expect(modules).toHaveLength(6);
  expect(venues).toHaveLength(4);
});

test('shows at most 10 choices when there are many venues', () => {
  const instance = make({
    moduleList: MODULES.slice(0, 10),
    venueList: VENUES.slice(0, 4),
  }).instance() as SearchContainerComponent;
  const { modules, venues } = instance.getResults('1 ')!;
  expect(modules).toHaveLength(6);
  expect(venues).toHaveLength(4);
});

test('shows at most 10 choices when there are many modules', () => {
  const instance = make({ venueList: VENUES.slice(0, 2) }).instance() as SearchContainerComponent;
  const { modules, venues } = instance.getResults('1 ')!;
  expect(modules).toHaveLength(8);
  expect(venues).toHaveLength(2);
});

test('shows all results when there are few', () => {
  const instance = make().instance() as SearchContainerComponent;
  const { modules, venues } = instance.getResults('AA')!;
  expect(modules).toHaveLength(1);
  expect(venues).toHaveLength(1);
});

test('show many results if the search only returns results of one type', () => {
  const instance = make({
    venueList: _.range(100).map((n) => `Venue ${n}`),
  }).instance() as SearchContainerComponent;

  let { modules, venues } = instance.getResults('1010')!;
  expect(modules).toHaveLength(70);
  expect(venues).toHaveLength(0);

  ({ modules, venues } = instance.getResults('venue')!);
  expect(modules).toHaveLength(0);
  expect(venues).toHaveLength(70);
});
