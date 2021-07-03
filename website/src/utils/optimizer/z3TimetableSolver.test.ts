import {
  Z3TimetableSolver,
  SELECTOR_PREFIX,
  SELECTOR_FULFIL_N_PREFIX,
  SELECTOR_OPTIONAL_PREFIX,
} from 'utils/optimizer/z3TimetableSolver';
import { SlotConstraint } from 'types/optimizer';

describe('constructor', () => {
  test('constructs initial time arrays list as expected', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(z3ts.timevars).toEqual(['t0', 't1', 't2', 't3']);
  });

  test('constructs initial time arrays list with string variables', () => {
    const z3ts = new Z3TimetableSolver(4, ['h0', 'h1', 'h2', 'h3']);
    expect(z3ts.timevars).toEqual(['t0_h0', 't1_h1', 't2_h2', 't3_h3']);
  });

  test('errors when too many variable names are passed', () => {
    expect(() => new Z3TimetableSolver(2, ['h0', 'h1', 'h2'])).toThrow();
  });

  test('errors when too few variable names are passed', () => {
    expect(() => new Z3TimetableSolver(2, ['h0'])).toThrow();
  });
});

// Constants for tests
const sc: SlotConstraint = {
  startEndTimes: [[0, 1]],
  ownerId: 7,
  ownerString: '7',
}; // ID 7 assigned to slots 0 and 1
const sc2: SlotConstraint = {
  startEndTimes: [[2, 3]],
  ownerId: 8,
  ownerString: '8',
}; // ID 8 assigned to slots 2 and 3
const scErrorSmaller: SlotConstraint = {
  startEndTimes: [[-2, -3]],
  ownerId: 8,
  ownerString: '8',
};
const scErrorLarger: SlotConstraint = {
  startEndTimes: [[16, 17]],
  ownerId: 8,
  ownerString: '8',
};

describe('addSlotConstraintsFulfilOnlyOne', () => {
  test('generates expected smtlib2 string when choosing between one of two slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    z3ts.addSlotConstraintsFulfilOnlyOne([sc, sc2]);

    // Expect
    const expected = `(declare-fun ${SELECTOR_PREFIX}7_8 () Int)
(declare-fun t0 () Int)
(declare-fun t2 () Int)
(assert (or (= ${SELECTOR_PREFIX}7_8 7) (= ${SELECTOR_PREFIX}7_8 8)))
(assert (= (= ${SELECTOR_PREFIX}7_8 7) (= t0 7)))
(assert (= (= ${SELECTOR_PREFIX}7_8 8) (= t2 8)))
(assert (or (= t0 7) (= t0 -1)))
(assert (or (= t2 8) (= t2 -1)))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  test('generates expected smtlib2 string when choosing between one of two slots with an extra boolean variable', () => {
    const z3ts = new Z3TimetableSolver(4);

    const boolVar = 'booleanSelector';
    z3ts.addSlotConstraintsFulfilOnlyOne([sc, sc2], boolVar);

    // Expect
    const expected = `(declare-fun ${SELECTOR_OPTIONAL_PREFIX}booleanSelector () Bool)
(declare-fun ${SELECTOR_PREFIX}7_8 () Int)
(declare-fun t0 () Int)
(declare-fun t2 () Int)
(assert (= ${SELECTOR_OPTIONAL_PREFIX}booleanSelector (or (= ${SELECTOR_PREFIX}7_8 7) (= ${SELECTOR_PREFIX}7_8 8))))
(assert (= (= ${SELECTOR_PREFIX}7_8 7) (= t0 7)))
(assert (= (= ${SELECTOR_PREFIX}7_8 8) (= t2 8)))
(assert (or (= t0 7) (= t0 -1)))
(assert (or (= t2 8) (= t2 -1)))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  test('errors when slotConstraint when too small a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilOnlyOne([sc2, scErrorSmaller])).toThrow();
  });

  test('errors when slotConstraint when too large a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilOnlyOne([sc2, scErrorLarger])).toThrow();
  });
});

const sc3: SlotConstraint = {
  startEndTimes: [[0, 1]],
  ownerId: 9,
  ownerString: '9',
}; // ID 7 assigned to slots 0 and 1
describe('addSlotConstraintsFulfilExactlyN', () => {
  test('generates expected smtlib2 string when choosing between two of three slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    z3ts.addSlotConstraintsFulfilExactlyN([sc, sc2, sc3], 2);
    // Expect
    const expected = `(declare-fun ${SELECTOR_FULFIL_N_PREFIX}7 () Bool)
(declare-fun ${SELECTOR_FULFIL_N_PREFIX}8 () Bool)
(declare-fun ${SELECTOR_FULFIL_N_PREFIX}9 () Bool)
(declare-fun t0 () Int)
(declare-fun t2 () Int)
(assert (= ${SELECTOR_FULFIL_N_PREFIX}7 (= t0 7)))
(assert (= ${SELECTOR_FULFIL_N_PREFIX}8 (= t2 8)))
(assert (= ${SELECTOR_FULFIL_N_PREFIX}9 (= t0 9)))
(assert ((_ pbeq 2 1 1 1) ${SELECTOR_FULFIL_N_PREFIX}7 ${SELECTOR_FULFIL_N_PREFIX}8 ${SELECTOR_FULFIL_N_PREFIX}9))
(assert (or (= t0 7) (= t0 -1) (= t0 9)))
(assert (or (= t2 8) (= t2 -1)))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  test('errors when slotConstraint when too small a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc2, scErrorSmaller], 1)).toThrow();
  });

  test('errors when slotConstraint when too large a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc2, scErrorLarger], 1)).toThrow();
  });

  test('errors when asked to choosing less than 0 slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc, sc2, sc3], -1)).toThrow();
  });
  test('errors when asked to choosing more than the passed slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc, sc2, sc3], 7)).toThrow();
  });
});
